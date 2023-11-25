import axios from 'axios';

const DATA_URL_HEADER = 'data:image/svg+xml;base64,';

export async function svgToDataUrl(url?: string) {
  if (!url) return;

  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' });
    const encoded = Buffer.from(data, 'binary').toString('base64');
    return DATA_URL_HEADER + encoded;
  } catch (error) {
    console.error('svgToDataURL error', error);
    return;
  }
}
