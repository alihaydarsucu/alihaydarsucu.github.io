const fs = require('fs');
const xml2js = require('xml2js');

const rssXml = fs.readFileSync('blog-rss.xml', 'utf8');

const extractHashtags = (text) => {
  if (!text) return [];
  const matches = text.match(/#[\p{L}][\p{L}\p{N}_\-]*/gu) || [];
  return Array.from(new Set(matches));
};

const extractPrefixes = (text) => {
  if (!text) return [];
  // category:technical, lang:tr, subcategory:embedded gibi pattern'leri çıkar
  const matches = text.match(/(?:category|lang|subcategory):[a-z]+/gi) || [];
  return matches;
};

xml2js.parseString(rssXml, (err, result) => {
  if (err) {
    console.error('XML parse error:', err);
    process.exit(1);
  }

  const items = result.rss.channel[0].item || [];
  const posts = items.map(item => {
    const title = item.title[0] || '';
    const description = item.description[0] || '';
    const link = item.link[0] || '';
    const pubDate = item.pubDate[0] || '';
    // Etiketleri çıkar
    let categories = [];
    if (item.category) {
      categories = item.category.map(cat => cat._ || cat);
    }
    // content:encoded'den tam içeriği al
    const contentEncoded = item['content:encoded'] ? item['content:encoded'][0] : '';
    // Hashtag'leri çıkar
    if (contentEncoded) {
      const hashtags = extractHashtags(contentEncoded);
      const prefixes = extractPrefixes(contentEncoded);
      categories.push(...hashtags);
      categories.push(...prefixes);
    }
    // Tam içeriği description olarak kullan (content:encoded varsa onu kullan)
    const fullContent = contentEncoded || description;
    // Slug çıkar - link'ten /p/ sonrasını al
    const slug = link.split('/p/')[1] || null;
    // Dil belirle - categories içinde lang:tr veya lang:en ara
    let lang = null;
    if (categories.includes('lang:tr')) {
      lang = 'tr';
    } else if (categories.includes('lang:en')) {
      lang = 'en';
    }
    // Ana kategori belirle - category:technical, category:history, category:fiction
    let category = null;
    if (categories.includes('category:technical')) {
      category = 'technical';
    } else if (categories.includes('category:history')) {
      category = 'history';
    } else if (categories.includes('category:fiction')) {
      category = 'fiction';
    }
    // Alt kategori belirle (sadece technical için)
    let subcategory = null;
    if (categories.includes('subcategory:systems')) {
      subcategory = 'systems';
    } else if (categories.includes('subcategory:embedded')) {
      subcategory = 'embedded';
    } else if (categories.includes('subcategory:ai')) {
      subcategory = 'ai';
    }
    return {
      title,
      description: fullContent, // content:encoded'i kullan
      link,
      pubDate,
      slug: slug,
      lang: lang,
      category: category,
      subcategory: subcategory,
      categories: Array.from(new Set(categories))
    };
  });
  // Değişiklik kontrolü - sadece değişirse JSON yaz
  const newData = JSON.stringify({ status: 'ok', items: posts }, null, 2);
  let shouldUpdate = true;
  if (fs.existsSync('blog-posts.json')) {
    const oldData = fs.readFileSync('blog-posts.json', 'utf8');
    if (oldData === newData) {
      console.log('No changes detected, skipping update');
      process.exit(0);
    }
  }
  fs.writeFileSync('blog-posts.json', newData);
  console.log(`Processed ${posts.length} blog posts - changes detected`);
});