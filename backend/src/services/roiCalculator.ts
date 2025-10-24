import { Pool } from 'pg';
import { logger } from '../utils/logger';

interface ROIMetrics {
  totalConflictsAvoided: number;
  avgConflictResolutionTime: number; // minutes
  timesSaved: number; // hours
  costSavings: number; // USD
  developerHourlyCost: number;
  preventedBuildFailures: number;
  cicdTimeSaved: number; // hours
  totalROI: number;
  projectedAnnualSavings: number;
}

interface EngineeringBottleneck {
  type: 'long_pr_review' | 'merge_conflicts' | 'slow_ci' | 'delayed_deployments';
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedCost: number;
  recommendation: string;
}

export class ROICalculator {
  private pool: Pool;
  private readonly DEFAULT_HOURLY_COST = 75; // Average developer hourly cost

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Calculate comprehensive ROI metrics for a repository
   */
  async calculateROI(repositoryId: number, timeframeDays: number = 30): Promise<ROIMetrics> {
    try {
      logger.info(`Calculating ROI for repository ${repositoryId} over ${timeframeDays} days`);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeframeDays);

      // Get conflict data
      const conflictData = await this.getConflictMetrics(repositoryId, startDate);

      // Get prediction accuracy
      const predictionData = await this.getPredictionMetrics(repositoryId, startDate);

      // Get engineering metrics
      const engineeringData = await this.getEngineeringMetrics(repositoryId, startDate);

      // Calculate time and cost savings
      const conflictsAvoided = Math.floor(predictionData.totalPredictions * predictionData.accuracyRate);
      const avgResolutionTime = conflictData.avgResolutionMinutes || 45; // default 45 min
      const timesSavedHours = (conflictsAvoided * avgResolutionTime) / 60;

      const hourlyCost = this.DEFAULT_HOURLY_COST;
      const costSavings = timesSavedHours * hourlyCost;

      // Calculate CI/CD improvements
      const cicdTimeSaved = this.calculateCICDSavings(engineeringData);
      const cicdCostSavings = cicdTimeSaved * (hourlyCost / 2); // CI/CD time valued at 50% of dev time

      // Calculate total ROI
      const totalCostSavings = costSavings + cicdCostSavings;
      const projectedAnnualSavings = (totalCostSavings / timeframeDays) * 365;

      const metrics: ROIMetrics = {
        totalConflictsAvoided: conflictsAvoided,
        avgConflictResolutionTime: avgResolutionTime,
        timesSaved: timesSavedHours,
        costSavings: costSavings,
        developerHourlyCost: hourlyCost,
        preventedBuildFailures: predictionData.preventedFailures || 0,
        cicdTimeSaved: cicdTimeSaved,
        totalROI: totalCostSavings,
        projectedAnnualSavings: projectedAnnualSavings
      };

      logger.info(`ROI calculated: $${totalCostSavings.toFixed(2)} saved over ${timeframeDays} days`);

      return metrics;
    } catch (error) {
      logger.error('Error calculating ROI:', error);
      throw error;
    }
  }

  /**
   * Identify engineering bottlenecks and their costs
   */
  async identifyBottlenecks(repositoryId: number): Promise<EngineeringBottleneck[]> {
    const bottlenecks: EngineeringBottleneck[] = [];

    try {
      const metrics = await this.pool.query(
        `SELECT * FROM engineering_metrics
         WHERE repository_id = $1
         ORDER BY metric_date DESC
         LIMIT 30`,
        [repositoryId]
      );

      if (metrics.rows.length === 0) {
        return bottlenecks;
      }

      const avgMetrics = this.calculateAverageMetrics(metrics.rows);

      // Check for slow PR reviews
      if (avgMetrics.code_review_time > 240) { // > 4 hours
        const reviewCost = ((avgMetrics.code_review_time / 60) - 2) * this.DEFAULT_HOURLY_COST * avgMetrics.prsPerWeek;
        bottlenecks.push({
          type: 'long_pr_review',
          description: `Average PR review time is ${(avgMetrics.code_review_time / 60).toFixed(1)} hours`,
          impact: avgMetrics.code_review_time > 480 ? 'high' : 'medium',
          estimatedCost: reviewCost,
          recommendation: 'Implement automated code review tools and set review SLAs'
        });
      }

      // Check for frequent merge conflicts
      if (avgMetrics.conflictRate > 0.15) { // > 15% of PRs
        const conflictCost = avgMetrics.conflictRate * avgMetrics.prsPerWeek * (avgMetrics.avgConflictResolution / 60) * this.DEFAULT_HOURLY_COST;
        bottlenecks.push({
          type: 'merge_conflicts',
          description: `${(avgMetrics.conflictRate * 100).toFixed(1)}% of PRs have merge conflicts`,
          impact: avgMetrics.conflictRate > 0.25 ? 'high' : 'medium',
          estimatedCost: conflictCost,
          recommendation: 'Use GitFlow AI predictions to identify conflicts early and reduce branch lifetimes'
        });
      }

      // Check for slow CI/CD
      if (avgMetrics.cycle_time > 48) { // > 48 hours
        bottlenecks.push({
          type: 'slow_ci',
          description: `Average cycle time is ${avgMetrics.cycle_time} hours`,
          impact: 'high',
          estimatedCost: ((avgMetrics.cycle_time - 24) / 24) * this.DEFAULT_HOURLY_COST * avgMetrics.prsPerWeek,
          recommendation: 'Optimize CI/CD pipeline and implement parallel testing'
        });
      }

      logger.info(`Identified ${bottlenecks.length} bottlenecks for repository ${repositoryId}`);
      return bottlenecks;
    } catch (error) {
      logger.error('Error identifying bottlenecks:', error);
      throw error;
    }
  }

  private async getConflictMetrics(repositoryId: number, startDate: Date) {
    const result = await this.pool.query(
      `SELECT
        COUNT(*) as total_conflicts,
        AVG(resolution_time) as avg_resolution_minutes,
        AVG(CASE WHEN resolved THEN 1 ELSE 0 END) as resolution_rate
       FROM merge_conflicts
       WHERE repository_id = $1 AND detected_at >= $2`,
      [repositoryId, startDate]
    );

    return {
      totalConflicts: parseInt(result.rows[0]?.total_conflicts || '0'),
      avgResolutionMinutes: parseFloat(result.rows[0]?.avg_resolution_minutes || '45'),
      resolutionRate: parseFloat(result.rows[0]?.resolution_rate || '0.85')
    };
  }

  private async getPredictionMetrics(repositoryId: number, startDate: Date) {
    const result = await this.pool.query(
      `SELECT
        COUNT(*) as total_predictions,
        AVG(CASE WHEN correct_prediction THEN 1 ELSE 0 END) as accuracy_rate,
        SUM(CASE WHEN prediction_type = 'build_failure' AND correct_prediction THEN 1 ELSE 0 END) as prevented_failures
       FROM ml_predictions
       WHERE repository_id = $1 AND created_at >= $2`,
      [repositoryId, startDate]
    );

    return {
      totalPredictions: parseInt(result.rows[0]?.total_predictions || '0'),
      accuracyRate: parseFloat(result.rows[0]?.accuracy_rate || '0.78'),
      preventedFailures: parseInt(result.rows[0]?.prevented_failures || '0')
    };
  }

  private async getEngineeringMetrics(repositoryId: number, startDate: Date) {
    const result = await this.pool.query(
      `SELECT
        AVG(cycle_time) as avg_cycle_time,
        AVG(lead_time) as avg_lead_time,
        AVG(deployment_frequency) as avg_deploy_freq
       FROM engineering_metrics
       WHERE repository_id = $1 AND metric_date >= $2`,
      [repositoryId, startDate]
    );

    return result.rows[0] || {};
  }

  private calculateCICDSavings(engineeringData: any): number {
    // Estimate CI/CD time savings based on faster cycle times and fewer failed builds
    const baselineCycleTime = 24; // hours
    const actualCycleTime = engineeringData.avg_cycle_time || baselineCycleTime;
    const improvement = Math.max(0, baselineCycleTime - actualCycleTime);

    return improvement * 4; // Assume 4 deployments per week
  }

  private calculateAverageMetrics(rows: any[]): any {
    const sum = rows.reduce((acc, row) => ({
      code_review_time: (acc.code_review_time || 0) + (row.code_review_time || 0),
      cycle_time: (acc.cycle_time || 0) + (row.cycle_time || 0),
      pr_merge_time: (acc.pr_merge_time || 0) + (row.pr_merge_time || 0)
    }), {});

    return {
      code_review_time: sum.code_review_time / rows.length,
      cycle_time: sum.cycle_time / rows.length,
      pr_merge_time: sum.pr_merge_time / rows.length,
      prsPerWeek: 20, // Estimate
      conflictRate: 0.12, // Estimate
      avgConflictResolution: 45 // minutes
    };
  }
}
