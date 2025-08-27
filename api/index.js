const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { isbn } = req.query;

  if (!isbn) {
    return res.status(400).json({ error: 'ISBN parameter is required' });
  }

  const url = `https://book.douban.com/isbn/${isbn}/`;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
  };

  try {
    const response = await axios.get(url, { headers });
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('#wrapper > h1 > span').text().trim();
    const author = $('#info a').first().text().trim();
    const publisher = $('#info').text().match(/出版社:\s*(.*)/)?.[1].trim() || '未知';
    const pubdate = $('#info').text().match(/出版年:\s*(.*)/)?.[1].trim() || '未知';
    const real_isbn = $('#info').text().match(/ISBN:\s*(.*)/)?.[1].trim() || '未知';
    const rating = $('.rating_num').text().trim() || '暂无评分';
    const summary = $('#link-report .intro p').text().trim() || '无简介';
    const cover_image = $('#mainpic > a > img').attr('src') || '';
    const tags = [];
    $('#db-tags-section .tag').each((i, el) => {
      tags.push($(el).text().trim());
    });

    const bookData = {
      book_title: title,
      book_author: author,
      book_description: summary,
      book_thumbnail: cover_image,
      book_tags: tags,
      book_publisher: publisher,
      book_pubdate: pubdate,
      book_isbn: real_isbn,
      book_rating: rating
    };
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(bookData);

  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Failed to fetch or parse Douban page.' });
  }
};
