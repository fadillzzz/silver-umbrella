const {
  isValidUrl,
  fetchPage,
  printMetadata,
  getUrlFileName,
} = require("./lib");
const path = require("path");
const fs = require("node:fs/promises");
jest.mock("node:fs/promises");

describe("Lib", () => {
  describe("isValidUrl", () => {
    it("should return true for a valid URL", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
    });

    it("should return false for an invalid URL", () => {
      expect(isValidUrl("saiudfhgiasudf")).toBe(false);
    });

    it("should consider a URL without a protocol invalid", () => {
      expect(isValidUrl("example.com")).toBe(false);
    });
  });

  describe("getUrlFileName", () => {
    it("should generate a filename from a URL", () => {
      expect(getUrlFileName("https://example.com")).toBe(
        path.join(__dirname, "example.com.html")
      );
    });

    it("should generate a filename from a URL with a path", () => {
      expect(getUrlFileName("https://example.com/path/to/file")).toBe(
        path.join(__dirname, "example.com_path_to_file.html")
      );
    });
  });

  describe("fetchPage", () => {
    it("should fetch a page and save it to a file", async () => {
      const gotoMock = jest.fn();
      const contentMock = jest.fn().mockResolvedValue("content");

      const browser = {
        newPage: jest.fn().mockResolvedValue({
          goto: gotoMock,
          content: contentMock,
        }),
      };

      await fetchPage(browser, "https://example.com");

      expect(browser.newPage).toHaveBeenCalled();
      expect(gotoMock).toHaveBeenCalledWith("https://example.com");
      expect(contentMock).toHaveBeenCalled();

      expect(fs.writeFile).toHaveBeenCalledWith(
        getUrlFileName("https://example.com"),
        "content"
      );
    });

    it("should handle errors", async () => {
      const browser = {
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn().mockRejectedValue(new Error("error")),
        }),
      };

      console.error = jest.fn();

      await fetchPage(browser, "https://example.com");

      expect(console.error).toHaveBeenCalledWith(
        "Unexpected error occurred while fetching https://example.com: error"
      );
    });
  });

  describe("printMetadata", () => {
    it("should print metadata for a URL", async () => {
      const gotoMock = jest.fn();
      const evalMock = jest
        .fn()
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(17);
      const fileName = getUrlFileName("https://example.com");

      const browser = {
        newPage: jest.fn().mockResolvedValue({
          goto: gotoMock,
          $$eval: evalMock,
        }),
      };

      const now = new Date().toISOString();
      fs.stat.mockResolvedValue({
        mtime: now,
      });

      await printMetadata(browser, "https://example.com");

      expect(fs.access).toHaveBeenCalledWith(fileName);
      expect(browser.newPage).toHaveBeenCalled();
      expect(gotoMock).toHaveBeenCalledWith(`file:${fileName}`);
      expect(evalMock).toHaveBeenCalledWith("a", expect.any(Function));
      expect(evalMock).toHaveBeenCalledWith("img", expect.any(Function));
      expect(fs.stat).toHaveBeenCalledWith(fileName);
    });
  });
});
