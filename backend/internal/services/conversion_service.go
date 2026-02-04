package services

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

type ConversionService struct{}

func NewConversionService() *ConversionService {
	return &ConversionService{}
}

// ConvertImage converts image formats using ffmpeg
func (s *ConversionService) ConvertImage(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath,
		"-y", // Overwrite output file
		outputPath,
	)
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("ffmpeg conversion failed: %w", err)
	}
	
	return nil
}

// ConvertVideo converts video formats using ffmpeg
func (s *ConversionService) ConvertVideo(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath,
		"-c:v", "libx264", // Video codec
		"-c:a", "aac",     // Audio codec
		"-y",
		outputPath,
	)
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("video conversion failed: %w", err)
	}
	
	return nil
}

// ConvertAudio converts audio formats using ffmpeg
func (s *ConversionService) ConvertAudio(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath,
		"-y",
		outputPath,
	)
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("audio conversion failed: %w", err)
	}
	
	return nil
}

// ConvertDocument converts document formats using pandoc (if available)
func (s *ConversionService) ConvertDocument(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	// Try pandoc first for better quality conversions
	cmd := exec.CommandContext(ctx, "pandoc",
		inputPath,
		"-o", outputPath,
	)
	
	if err := cmd.Run(); err != nil {
		// Fallback to simple text copy if pandoc not available
		data, readErr := os.ReadFile(inputPath)
		if readErr != nil {
			return fmt.Errorf("failed to read input: %w", readErr)
		}
		
		if writeErr := os.WriteFile(outputPath, data, 0644); writeErr != nil {
			return fmt.Errorf("failed to write output: %w", writeErr)
		}
	}
	
	return nil
}

// ConvertArchive handles archive format conversions
func (s *ConversionService) ConvertArchive(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	// For now, just copy the file
	// TODO: Implement proper archive conversion using tools like 7z, tar, etc.
	data, err := os.ReadFile(inputPath)
	if err != nil {
		return fmt.Errorf("failed to read archive: %w", err)
	}
	
	if err := os.WriteFile(outputPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write archive: %w", err)
	}
	
	return nil
}

// ApplyWatermark applies watermark to image/video using ffmpeg
func (s *ConversionService) ApplyWatermark(ctx context.Context, inputPath, outputPath, watermarkText string, position string) error {
	// For images and videos, use ffmpeg drawtext filter
	var filterStr string
	
	// Position mapping
	posMap := map[string]string{
		"top-left":     "x=10:y=10",
		"top-right":    "x=w-tw-10:y=10",
		"bottom-left":  "x=10:y=h-th-10",
		"bottom-right": "x=w-tw-10:y=h-th-10",
		"center":       "x=(w-tw)/2:y=(h-th)/2",
	}
	
	pos, ok := posMap[position]
	if !ok {
		pos = posMap["bottom-right"] // Default
	}
	
	filterStr = fmt.Sprintf("drawtext=text='%s':fontsize=24:fontcolor=white@0.5:%s", watermarkText, pos)
	
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath,
		"-vf", filterStr,
		"-codec:a", "copy", // Copy audio without re-encoding
		"-y",
		outputPath,
	)
	
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("watermark application failed: %w", err)
	}
	
	return nil
}

// GetFileCategory determines file category based on extension
func GetFileCategory(format string) string {
	imageFormats := map[string]bool{
		"png": true, "jpg": true, "jpeg": true, "webp": true, "gif": true,
		"bmp": true, "tiff": true, "svg": true, "ico": true, "heic": true,
	}
	
	videoFormats := map[string]bool{
		"mp4": true, "avi": true, "mov": true, "mkv": true, "webm": true,
		"flv": true, "wmv": true, "m4v": true,
	}
	
	audioFormats := map[string]bool{
		"mp3": true, "wav": true, "aac": true, "flac": true, "ogg": true,
		"m4a": true, "wma": true, "aiff": true,
	}
	
	documentFormats := map[string]bool{
		"pdf": true, "docx": true, "doc": true, "txt": true, "rtf": true,
		"odt": true, "html": true, "md": true,
	}
	
	if imageFormats[format] {
		return "image"
	}
	if videoFormats[format] {
		return "video"
	}
	if audioFormats[format] {
		return "audio"
	}
	if documentFormats[format] {
		return "document"
	}
	
	return "archive"
}

// GetTempPath generates a temporary file path
func GetTempPath(filename string) string {
	tempDir := os.TempDir()
	return filepath.Join(tempDir, filename)
}
