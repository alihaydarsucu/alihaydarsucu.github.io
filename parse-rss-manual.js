const fs = require('fs');
const xml2js = require('xml2js');

const rssXml = fs.readFileSync('blog-rss-test.xml', 'utf8');

xml2js.parseString(rssXml, (err, result) => {
  if (err) {
    console.error('XML parse error:', err);
    process.exit(1);
  }

  const extractHashtags = (text) => {
    if (!text) return [];
    const matches = text.match(/#[\p{L}][\p{L}\p{N}_\-]*/gu) || [];
    return Array.from(new Set(matches));
  };
  
  const items = result.rss.channel[0].item || [];
  const posts = items.map(item => {
    const title = item.title[0] || '';
    const description = item.description[0] || '';
    const link = item.link[0] || '';
    const pubDate = item.pubDate[0] || '';
    
    let categories = [];
    if (item.category) {
      categories = item.category.map(cat => cat._ || cat);
    }
    
    const contentEncoded = item['content:encoded'] ? item['content:encoded'][0] : '';
    
    if (contentEncoded) {
      const hashtags = extractHashtags(contentEncoded);
      categories.push(...hashtags);
    }
    
    const fullContent = contentEncoded || description;
    const slug = link.split('/p/')[1] || null;
    
    let lang = null;
    if (categories.includes('lang:tr')) lang = 'tr';
    else if (categories.includes('lang:en')) lang = 'en';
    
    let category = null;
    if (categories.includes('category:technical')) category = 'technical';
    else if (categories.includes('category:history')) category = 'history';
    else if (categories.includes('category:fiction')) category = 'fiction';
    
    let subcategory = null;
    if (categories.includes('subcategory:systems')) subcategory = 'systems';
    else if (categories.includes('subcategory:embedded')) subcategory = 'embedded';
    else if (categories.includes('subcategory:ai')) subcategory = 'ai';
    
    return {
      title,
      description: fullContent,
      link,
      pubDate,
      slug: slug,
      lang: lang,
      category: category,
      subcategory: subcategory,
      categories: Array.from(new Set(categories))
    };
  });
  
  fs.writeFileSync('blog-posts.json', JSON.stringify({ status: 'ok', items: posts }, null, 2));
  console.log(`✅ Parsed ${posts.length} posts`);
  posts.forEach(p => console.log(`- ${p.title} [${p.category || 'uncategorized'}/${p.subcategory || 'none'}] (${p.lang || 'no-lang'})`));
});
