const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;
const baseURL = 'https://www.mercadolibre.cl/p/';

// Función para extraer el MLCID de una URL de MercadoLibre
async function getMLCID(mlcID) {
  try {
    const url = baseURL + mlcID;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const metaTag = $('meta[name="twitter:app:url:iphone"]');

    if (metaTag.length > 0) {
      const content = metaTag.attr('content');
      const mlcidMatch = content.match(/id=MLC(\d+)/);

      if (mlcidMatch) {
        const mlcid = mlcidMatch[1];
        return mlcid;
      }
    }

    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Ruta para realizar el scraping y guardar el resultado en un archivo JSON
app.get('/scrape/:mlcID', async (req, res) => {
  const mlcID = req.params.mlcID; // Obtiene el MLCID de la ruta

  if (!mlcID) {
    res.status(400).json({ error: 'Debes proporcionar un MLCID válido.' });
    return;
  }

  const mlcid = await getMLCID(mlcID);

  if (mlcid) {
    const result = { MLCID: mlcid };
    fs.writeFileSync('result.json', JSON.stringify(result, null, 2)); // Guarda el resultado en un archivo JSON
    res.json(result);
  } else {
    res.status(404).json({ error: 'No se encontró el MLCID para el MLCID proporcionado.' });
  }
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

