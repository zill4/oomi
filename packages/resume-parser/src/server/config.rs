use std::sync::Arc;
use crate::config::Config;

#[derive(Clone)]
pub struct ServerConfig {
    pub config: Arc<Config>,
}

impl ServerConfig {
    pub fn new(config: Config) -> Self {
        Self {
            config: Arc::new(config),
        }
    }
} 