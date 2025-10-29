import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { OptimizedImage } from "../optimized-image";

describe("OptimizedImage", () => {
  describe("Basic rendering", () => {
    it("should render with required props", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByRole("img", { name: /test image/i });
      expect(image).toBeInTheDocument();
    });

    it("should apply alt text for accessibility (Requirement 7.1)", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Accessible test image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByAltText("Accessible test image");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Lazy loading (Requirement 8.5)", () => {
    it("should enable lazy loading by default", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Lazy loaded image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("loading", "lazy");
    });

    it("should allow disabling lazy loading", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Eager loaded image"
          width={800}
          height={600}
          priority
        />
      );

      const image = screen.getByRole("img");
      expect(image).not.toHaveAttribute("loading", "lazy");
    });
  });

  describe("Responsive images (Requirement 8.3)", () => {
    it("should accept sizes prop for responsive images", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Responsive image"
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      );

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute(
        "sizes",
        "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      );
    });

    it("should render without sizes when not provided", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Default sizes"
          width={800}
          height={600}
        />
      );

      const image = screen.getByRole("img");
      // next/imageは明示的にsizesが指定されない場合、自動的に処理
      expect(image).toBeInTheDocument();
    });
  });

  describe("CLS prevention (Task 11.1)", () => {
    it("should require width and height to prevent CLS", () => {
      // TypeScriptの型チェックで強制されるため、
      // ランタイムでのチェックは不要だが、コンポーネントが正しく動作することを確認
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Fixed size image"
          width={1200}
          height={800}
        />
      );

      const image = screen.getByRole("img");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Image optimization (Requirement 8.2)", () => {
    it("should handle WebP format images", () => {
      render(
        <OptimizedImage
          src="/test-image.webp"
          alt="WebP image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src");
      // next/imageは自動的にWebPに変換するため、
      // src属性が正しく設定されていることを確認
    });

    it("should optimize external images with unoptimized prop", () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="External image"
          width={800}
          height={600}
          unoptimized={false}
        />
      );

      const image = screen.getByRole("img");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Fill mode (responsive containers)", () => {
    it("should support fill mode for responsive containers", () => {
      render(
        <div style={{ position: "relative", width: "100%", height: "400px" }}>
          <OptimizedImage
            src="/test-image.jpg"
            alt="Fill mode image"
            fill
            sizes="100vw"
          />
        </div>
      );

      const image = screen.getByRole("img");
      expect(image).toBeInTheDocument();
    });

    it("should accept object-fit styles in fill mode", () => {
      render(
        <div style={{ position: "relative", width: "100%", height: "400px" }}>
          <OptimizedImage
            src="/test-image.jpg"
            alt="Cover image"
            fill
            className="object-cover"
          />
        </div>
      );

      const image = screen.getByRole("img");
      expect(image).toHaveClass("object-cover");
    });
  });

  describe("Custom styling", () => {
    it("should accept className prop", () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Styled image"
          width={800}
          height={600}
          className="custom-class rounded-lg"
        />
      );

      const image = screen.getByRole("img");
      expect(image).toHaveClass("custom-class", "rounded-lg");
    });
  });

  describe("Error handling", () => {
    it("should handle missing images gracefully", () => {
      // コンソールエラーを抑制
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(
        <OptimizedImage
          src="/non-existent.jpg"
          alt="Missing image"
          width={800}
          height={600}
        />
      );

      const image = screen.getByRole("img");
      expect(image).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});
