use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationConfig {
    pub quality: VideoQuality,
    pub duration: u8,
    pub mode: GenerationMode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum VideoQuality {
    Standard,
    Hd,
    #[serde(rename = "4k")]
    FourK,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GenerationMode {
    Fast,
    Standard,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoResult {
    pub job_id: String,
    pub local_path: String,
    pub requested_duration_secs: f64,
    pub file_size_bytes: u64,
}

// Gemini API response types
#[derive(Debug, Deserialize)]
pub struct GeminiGenerateResponse {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct GeminiOperationResponse {
    #[allow(dead_code)]
    pub name: String,
    pub done: Option<bool>,
    pub response: Option<GeminiVideoResponse>,
    pub error: Option<GeminiError>,
}

#[derive(Debug, Deserialize)]
pub struct GeminiVideoResponse {
    #[serde(rename = "generateVideoResponse")]
    pub generate_video_response: GenerateVideoResponseInner,
}

#[derive(Debug, Deserialize)]
pub struct GenerateVideoResponseInner {
    #[serde(rename = "generatedSamples")]
    pub generated_samples: Vec<GeneratedSample>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct GeneratedSample {
    pub video: VideoData,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VideoData {
    pub uri: String,
}

#[derive(Debug, Deserialize)]
pub struct GeminiError {
    pub code: i32,
    pub message: String,
}
