import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { enhancePromptLocally } from "./src/promptEnhancer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Route: Generate Image
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, negative_prompt, width, height, seed, model, quality } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const safeSeed = seed || Math.floor(Math.random() * 10000000);
      const safeWidth = width || 512;
      const safeHeight = height || 512;
      const safeModel = model || "flux";

      // 1. Hugging Face Generation
      if (safeModel.startsWith("hf:")) {
        const hfModel = safeModel.replace("hf:", "");
        const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;

        if (!hfToken) {
          return res.status(401).json({
            error: "Hugging Face API key is missing. Please add HUGGINGFACE_API_KEY to your env/secrets configuration to use this model.",
            fallbackToPollinations: true
          });
        }

        const response = await fetch(
          `https://api-inference.huggingface.co/models/${hfModel}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${hfToken}`,
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                negative_prompt: negative_prompt || "",
                width: safeWidth,
                height: safeHeight,
                seed: safeSeed,
              },
            }),
          }
        );

        if (!response.ok) {
          const errMsg = await response.text();
          throw new Error(`Hugging Face API error: ${response.status} - ${errMsg}`);
        }

        // HF returns binary image data. Let's convert it to a base64 data URL
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        const contentType = response.headers.get("content-type") || "image/jpeg";
        const dataUrl = `data:${contentType};base64,${base64Image}`;

        return res.json({
          success: true,
          url: dataUrl,
          seed: safeSeed,
          model: safeModel,
          prompt,
          width: safeWidth,
          height: safeHeight,
        });
      }

      // 2. Pollinations AI (Default)
      // Build the URL
      let pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
      const params = new URLSearchParams();
      params.append("width", safeWidth.toString());
      params.append("height", safeHeight.toString());
      params.append("seed", safeSeed.toString());
      params.append("model", safeModel);
      params.append("nologo", "true");
      params.append("enhance", quality === "HD" ? "true" : "false");

      if (negative_prompt) {
        // Pollinations doesn't have a direct negative prompt param, but appending to prompt is standard practice
        pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " | negative prompt: " + negative_prompt)}`;
      }

      pollinationsUrl += `?${params.toString()}`;

      return res.json({
        success: true,
        url: pollinationsUrl,
        seed: safeSeed,
        model: safeModel,
        prompt,
        width: safeWidth,
        height: safeHeight,
      });

    } catch (error: any) {
      console.error("Generation error:", error);
      return res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // API Route: Enhance Prompt locally and offline
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const enhancedPrompt = enhancePromptLocally(prompt);
      return res.json({ success: true, enhancedPrompt });
    } catch (error: any) {
      console.error("Enhance prompt error:", error);
      return res.status(500).json({ error: error.message || "Failed to enhance prompt" });
    }
  });

  // CORS-Free Proxy Endpoint for downloading/copying external image URLs
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).send("URL parameter is required");
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).send("Failed to proxy image: " + error.message);
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
