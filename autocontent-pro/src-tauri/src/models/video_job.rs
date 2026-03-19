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

// --- Video Processing Pipeline types ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingConfig {
    pub scale_factor: u8,
    pub output_quality: OutputQuality,
    pub preserve_audio: bool,
    pub output_format: String,
    pub output_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum OutputQuality {
    Fast,
    Medium,
    High,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessingProgress {
    pub job_id: String,
    pub stage: String,
    pub current_frame: u32,
    pub total_frames: u32,
    pub percent: f32,
    pub message: String,
}

// --- Subtitle / Whisper types ---

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubtitleSegment {
    pub index: u32,
    pub start_ms: u64,
    pub end_ms: u64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum WhisperModel {
    Tiny,
    Base,
    Small,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionResult {
    pub segments: Vec<SubtitleSegment>,
    pub language: String,
    pub duration_ms: u64,
}

// --- Gemini API response types ---
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
