import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function generateImage(prompt: string) {
  try {
    console.log(`Generating image for prompt: "${prompt}"...`);

    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: { inputs: prompt },
      responseType: 'arraybuffer', // Receive binary data
    });

    return { imageBuffer: response.data, contentType: response.headers['content-type'] };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    const { imageBuffer, contentType } = await generateImage(prompt);

    res.setHeader('Content-Type', contentType); // Set the correct MIME type
    res.send(imageBuffer); // Stream the binary image directly
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ message: 'Error generating image' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});