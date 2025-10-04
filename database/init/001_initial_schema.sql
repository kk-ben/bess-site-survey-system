-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Sites table (候補地)
CREATE TABLE sites (
    site_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    area_sqm DECIMAL(10, 2),
    land_use VARCHAR(100),
    owner_info TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'approved', 'rejected')),
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on sites
CREATE INDEX idx_sites_location ON sites USING GIST(location);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_created_at ON sites(created_at DESC);

-- Grid assets table (変電所・配電線)
CREATE TABLE grid_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('substation', 'distribution_line', 'transmission_line')),
    asset_name VARCHAR(255),
    location GEOGRAPHY(POINT, 4326),
    geometry GEOGRAPHY(GEOMETRY, 4326),
    voltage_kv INTEGER,
    capacity_kw DECIMAL(10, 2),
    available_capacity_kw DECIMAL(10, 2),
    operator VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes on grid_assets
CREATE INDEX idx_grid_assets_location ON grid_assets USING GIST(location);
CREATE INDEX idx_grid_assets_geometry ON grid_assets USING GIST(geometry);
CREATE INDEX idx_grid_assets_type ON grid_assets(asset_type);
CREATE INDEX idx_grid_assets_voltage ON grid_assets(voltage_kv);

-- Amenities table (近隣施設)
CREATE TABLE amenities (
    amenity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amenity_type VARCHAR(100) NOT NULL,
    amenity_name VARCHAR(255),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    osm_id BIGINT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on amenities
CREATE INDEX idx_amenities_location ON amenities USING GIST(location);
CREATE INDEX idx_amenities_type ON amenities(amenity_type);
CREATE INDEX idx_amenities_osm_id ON amenities(osm_id);

-- Poles table (高圧電柱)
CREATE TABLE poles (
    pole_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pole_number VARCHAR(100),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    voltage_kv INTEGER,
    pole_type VARCHAR(50),
    operator VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on poles
CREATE INDEX idx_poles_location ON poles USING GIST(location);
CREATE INDEX idx_poles_voltage ON poles(voltage_kv);

-- Evaluations table (評価結果)
CREATE TABLE evaluations (
    evaluation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
    evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    evaluated_by UUID REFERENCES users(user_id),
    
    -- Grid connectivity score
    grid_score DECIMAL(5, 2),
    grid_distance_m DECIMAL(10, 2),
    nearest_asset_id UUID REFERENCES grid_assets(asset_id),
    nearest_asset_type VARCHAR(50),
    available_capacity_kw DECIMAL(10, 2),
    
    -- Setback score
    setback_score DECIMAL(5, 2),
    min_residential_distance_m DECIMAL(10, 2),
    violates_setback BOOLEAN DEFAULT false,
    nearby_amenities JSONB,
    
    -- Road access score
    road_score DECIMAL(5, 2),
    nearest_road_distance_m DECIMAL(10, 2),
    road_width_m DECIMAL(5, 2),
    road_type VARCHAR(100),
    
    -- Pole proximity score
    pole_score DECIMAL(5, 2),
    nearest_pole_distance_m DECIMAL(10, 2),
    nearest_pole_id UUID REFERENCES poles(pole_id),
    
    -- Overall score
    total_score DECIMAL(5, 2),
    weighted_score DECIMAL(5, 2),
    recommendation VARCHAR(50) CHECK (recommendation IN ('excellent', 'good', 'fair', 'poor', 'unsuitable')),
    recommendation_reason TEXT,
    
    -- Metadata
    config_used JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on evaluations
CREATE INDEX idx_evaluations_site_id ON evaluations(site_id);
CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date DESC);
CREATE INDEX idx_evaluations_total_score ON evaluations(total_score DESC);
CREATE INDEX idx_evaluations_recommendation ON evaluations(recommendation);

-- Config parameters table (評価パラメータ設定)
CREATE TABLE config_parameters (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Weights
    grid_weight DECIMAL(3, 2) DEFAULT 0.40,
    setback_weight DECIMAL(3, 2) DEFAULT 0.30,
    road_weight DECIMAL(3, 2) DEFAULT 0.20,
    pole_weight DECIMAL(3, 2) DEFAULT 0.10,
    
    -- Grid thresholds
    grid_max_distance_m INTEGER DEFAULT 1000,
    grid_min_capacity_kw DECIMAL(10, 2) DEFAULT 1000,
    
    -- Setback thresholds
    residential_setback_m INTEGER DEFAULT 50,
    school_setback_m INTEGER DEFAULT 100,
    hospital_setback_m INTEGER DEFAULT 100,
    
    -- Road thresholds
    road_max_distance_m INTEGER DEFAULT 100,
    road_min_width_m DECIMAL(5, 2) DEFAULT 4.0,
    
    -- Pole thresholds
    pole_max_distance_m INTEGER DEFAULT 100,
    
    created_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default config
INSERT INTO config_parameters (config_name, is_active) 
VALUES ('Default Configuration', true);

-- Data updates table (データ更新履歴)
CREATE TABLE data_updates (
    update_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type VARCHAR(100) NOT NULL,
    update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('manual', 'scheduled', 'api')),
    records_added INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message TEXT,
    metadata JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_data_updates_type ON data_updates(data_type);
CREATE INDEX idx_data_updates_status ON data_updates(status);
CREATE INDEX idx_data_updates_started_at ON data_updates(started_at DESC);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- User sessions table
CREATE TABLE user_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grid_assets_updated_at BEFORE UPDATE ON grid_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amenities_updated_at BEFORE UPDATE ON amenities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poles_updated_at BEFORE UPDATE ON poles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_parameters_updated_at BEFORE UPDATE ON config_parameters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
