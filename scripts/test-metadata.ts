const testUrls = [
  // E-commerce
  { name: 'Shopee', url: 'https://shopee.co.id/product/1494780300/29731820098' },
  { name: 'Tokopedia', url: 'https://www.tokopedia.com/nzx-id/sepatu-pria-wanita-unisex-cnvers-high-70s-blackwhite-parchment-cream-taylor' },
  { name: 'Blibli', url: 'https://www.blibli.com/p/sepatu-sneakers-pria-wanita-unisex-converse-chuck-taylor-all-star-hi-black-white/ps--BUM-70041-00001' },
  { name: 'TikTok Shop', url: 'https://shop.tiktok.com/view/product/1729384756382' },
  { name: 'OLX', url: 'https://www.olx.co.id/item/iphone-13-pro-max-128gb-garansi-resmi-ibox-iid-889988776' },

  // Social Media
  { name: 'TikTok Video', url: 'https://www.tiktok.com/@tiktok/video/7100000000000000000' },
  { name: 'Facebook', url: 'https://www.facebook.com/zuck/posts/10114000000000000' },
  { name: 'Twitter/X', url: 'https://x.com/elonmusk/status/1700000000000000000' },
  { name: 'Instagram', url: 'https://www.instagram.com/p/CwK00000000/' },
  { name: 'Threads', url: 'https://www.threads.com/@pesantuhan_/post/DXlZlT2Gb3e' },
  { name: 'Pinterest', url: 'https://id.pinterest.com/pin/1234567890/' }
];

async function runTests() {
  console.log('Starting Metadata Extraction Tests against localhost:3000...\n');

  for (const item of testUrls) {
    console.log(`Testing [${item.name}]: ${item.url}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/links/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url })
      });
      
      const resJson = await response.json();
      
      if (response.status !== 200 || resJson.error || !resJson.success) {
        console.log(`❌ FAILED: ${resJson.error || response.statusText}`);
      } else {
        const data = resJson.data;
        const hasImage = !!data.image;
        console.log(`${hasImage ? '✅' : '⚠️'} SUCCESS:`);
        console.log(`   Title: ${data.title?.substring(0, 50)}...`);
        console.log(`   Image: ${data.image}`);
        console.log(`   Type: ${data.type}`);
      }
    } catch (e: any) {
      console.log(`❌ EXCEPTION: ${e.message}`);
    }
    console.log('--------------------------------------------------\n');
  }
}

runTests();
