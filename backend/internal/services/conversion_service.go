package services

import (
	"context"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/phpdave11/gofpdf"
)

type ConversionService struct{}

func NewConversionService() *ConversionService {
	return &ConversionService{}
}

// ConvertImage converts image formats using ffmpeg
func (s *ConversionService) ConvertImage(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	if strings.EqualFold(outputFormat, "pdf") {
		return s.convertImageToPDF(ctx, inputPath, outputPath)
	}

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

func (s *ConversionService) convertImageToPDF(ctx context.Context, inputPath, outputPath string) error {
	sourcePath := inputPath
	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(inputPath), "."))
	imageType := ""

	if ext == "jpg" || ext == "jpeg" {
		imageType = "JPG"
	} else if ext == "png" {
		imageType = "PNG"
	} else {
		// Normalize to PNG using ffmpeg for unsupported image types (webp, tiff, etc.)
		tempFile, err := os.CreateTemp("", "gomorph-image-*.png")
		if err != nil {
			return fmt.Errorf("failed to create temp image: %w", err)
		}
		tempPath := tempFile.Name()
		if closeErr := tempFile.Close(); closeErr != nil {
			return fmt.Errorf("failed to close temp image: %w", closeErr)
		}
		defer os.Remove(tempPath)

		cmd := exec.CommandContext(ctx, "ffmpeg",
			"-i", inputPath,
			"-y",
			tempPath,
		)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("ffmpeg image normalize failed: %w", err)
		}

		sourcePath = tempPath
		imageType = "PNG"
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetCompression(true)

	info := pdf.RegisterImageOptions(sourcePath, gofpdf.ImageOptions{ImageType: imageType, ReadDpi: true})
	if info == nil {
		return fmt.Errorf("failed to read image for pdf")
	}

	pdf.AddPage()
	pageW, pageH := pdf.GetPageSize()
	imgW, imgH := info.Extent()
	if imgW == 0 || imgH == 0 {
		return fmt.Errorf("invalid image dimensions")
	}

	scale := math.Min(pageW/imgW, pageH/imgH)
	width := imgW * scale
	height := imgH * scale
	x := (pageW - width) / 2
	y := (pageH - height) / 2

	pdf.ImageOptions(sourcePath, x, y, width, height, false, gofpdf.ImageOptions{ImageType: imageType, ReadDpi: true}, 0, "")

	if err := pdf.OutputFileAndClose(outputPath); err != nil {
		return fmt.Errorf("failed to write pdf: %w", err)
	}

	return nil
}

// ConvertVideo converts video formats using ffmpeg
func (s *ConversionService) ConvertVideo(ctx context.Context, inputPath, outputPath, outputFormat string) error {
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath,
		"-c:v", "libx264", // Video codec
		"-c:a", "aac", // Audio codec
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

// GetFileCategory determines file category based on extension
func GetFileCategory(format string) string {
	imageFormats := map[string]bool{
		"png": true, "jpg": true, "webp": true, "gif": true, "svg": true,
	}

	videoFormats := map[string]bool{
		"mp4": true, "avi": true, "mov": true, "mkv": true, "webm": true,
	}

	audioFormats := map[string]bool{
		"mp3": true, "wav": true, "flac": true, "aac": true, "ogg": true,
	}

	documentFormats := map[string]bool{
		"pdf": true, "docx": true, "txt": true, "rtf": true, "odt": true,
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
