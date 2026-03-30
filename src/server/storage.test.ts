import { detectImageFormat, getManagedCloudinaryPublicId } from "./storage";

describe("storage image validation", () => {
  it("detects PNG files from signature bytes", () => {
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    expect(detectImageFormat(pngBytes)).toEqual({
      extension: ".png",
      mimeType: "image/png"
    });
  });

  it("detects JPEG files from signature bytes", () => {
    const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xdb]);

    expect(detectImageFormat(jpegBytes)).toEqual({
      extension: ".jpg",
      mimeType: "image/jpeg"
    });
  });

  it("rejects SVG payloads even if the caller labels them as images", () => {
    const svgBytes = new TextEncoder().encode("<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>");

    expect(detectImageFormat(svgBytes)).toBeNull();
  });

  it("extracts the managed Cloudinary public id from uploaded asset URLs", () => {
    const url =
      "https://res.cloudinary.com/dvzeqvbka/image/upload/v1719750000/arcetis/reward-images/174000-uuid-product-card.webp";

    expect(getManagedCloudinaryPublicId(url, "dvzeqvbka")).toBe(
      "arcetis/reward-images/174000-uuid-product-card"
    );
  });

  it("ignores Cloudinary URLs that do not belong to the managed Arcetis folder", () => {
    const url = "https://res.cloudinary.com/dvzeqvbka/image/upload/v1719750000/other-app/banner.png";

    expect(getManagedCloudinaryPublicId(url, "dvzeqvbka")).toBeNull();
  });
});
