use lazy_static::lazy_static;
use prometheus::{
    Gauge, Histogram, HistogramOpts, 
    IntCounterVec, Opts, Registry
};

lazy_static! {
    pub static ref REGISTRY: Registry = Registry::new();
    
    pub static ref PARSE_COUNTER: IntCounterVec = IntCounterVec::new(
        Opts::new("resume_parse_total", "Total number of resume parse attempts"),
        &["status"]
    ).unwrap();

    pub static ref PARSE_DURATION: Histogram = Histogram::with_opts(
        HistogramOpts::new(
            "resume_parse_duration_seconds",
            "Time taken to parse resumes"
        )
    ).unwrap();

    pub static ref ACTIVE_JOBS: Gauge = Gauge::new(
        "resume_parser_active_jobs",
        "Number of currently processing jobs"
    ).unwrap();

    pub static ref QUEUE_OPERATIONS: IntCounterVec = IntCounterVec::new(
        Opts::new("queue_operations_total", "Total number of queue operations"),
        &["operation", "status"]
    ).unwrap();
}

pub fn register_metrics() {
    REGISTRY.register(Box::new(PARSE_COUNTER.clone())).unwrap();
    REGISTRY.register(Box::new(PARSE_DURATION.clone())).unwrap();
    REGISTRY.register(Box::new(ACTIVE_JOBS.clone())).unwrap();
    REGISTRY.register(Box::new(QUEUE_OPERATIONS.clone())).unwrap();
} 