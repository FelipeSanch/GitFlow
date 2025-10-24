-- GitFlow AI Analytics Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    private BOOLEAN DEFAULT false,
    language VARCHAR(100),
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commits (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    sha VARCHAR(255) UNIQUE NOT NULL,
    author VARCHAR(255),
    message TEXT,
    files_changed INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    committed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pull_requests (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    github_id VARCHAR(255) UNIQUE NOT NULL,
    number INTEGER NOT NULL,
    title TEXT,
    state VARCHAR(50),
    author VARCHAR(255),
    base_branch VARCHAR(255),
    head_branch VARCHAR(255),
    files_changed INTEGER DEFAULT 0,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    merge_conflict BOOLEAN DEFAULT false,
    created_at_github TIMESTAMP,
    merged_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merge_conflicts (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    pull_request_id INTEGER REFERENCES pull_requests(id) ON DELETE CASCADE,
    file_path TEXT,
    conflict_type VARCHAR(100),
    resolution_time INTEGER, -- in minutes
    resolved BOOLEAN DEFAULT false,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_predictions (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    pull_request_id INTEGER REFERENCES pull_requests(id) ON DELETE SET NULL,
    prediction_type VARCHAR(100) NOT NULL, -- 'merge_conflict', 'build_failure', etc.
    confidence_score DECIMAL(5,4),
    predicted_outcome JSONB,
    actual_outcome JSONB,
    features_used JSONB,
    model_version VARCHAR(50),
    correct_prediction BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    metrics JSONB NOT NULL,
    roi_calculations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS engineering_metrics (
    id SERIAL PRIMARY KEY,
    repository_id INTEGER REFERENCES repositories(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    cycle_time INTEGER, -- in hours
    lead_time INTEGER, -- in hours
    deployment_frequency DECIMAL(10,2),
    change_failure_rate DECIMAL(5,4),
    mean_time_to_recovery INTEGER, -- in minutes
    code_review_time INTEGER, -- in minutes
    pr_merge_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(repository_id, metric_date)
);

-- Indexes for performance
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
CREATE INDEX idx_commits_repository_id ON commits(repository_id);
CREATE INDEX idx_commits_committed_at ON commits(committed_at);
CREATE INDEX idx_pull_requests_repository_id ON pull_requests(repository_id);
CREATE INDEX idx_pull_requests_state ON pull_requests(state);
CREATE INDEX idx_merge_conflicts_repository_id ON merge_conflicts(repository_id);
CREATE INDEX idx_merge_conflicts_resolved ON merge_conflicts(resolved);
CREATE INDEX idx_ml_predictions_repository_id ON ml_predictions(repository_id);
CREATE INDEX idx_analytics_snapshots_repository_id ON analytics_snapshots(repository_id);
CREATE INDEX idx_engineering_metrics_repository_id ON engineering_metrics(repository_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at BEFORE UPDATE ON repositories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pull_requests_updated_at BEFORE UPDATE ON pull_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
