import xml from 'xml2js';
import fs from 'fs';
import path from 'path';

main();

function main() {

  const xmlfile = process.argv[2] || '/Users/zbcjackson/Downloads/Movable_Type-2024-01-19-13-49-15-Backup/Movable_Type-2024-01-19-13-48-55-Backup-1.xml';
  const content = loadContent(xmlfile);
  let blog = {
    "meta":{
      "exported_on":  1388805572000,
      "version":      "5.76.0"
    },
    "data":{
      "posts": [],
      "posts_authors": [],
      "users": [],
    }
  };
  blog.data = extractData(content);

  const json = JSON.stringify(blog, null, 2);

  fs.writeFileSync('blog.json', json, 'utf8');

  renameImages(path.dirname(xmlfile));
}


function convertTimeFormat(time) {
  const year = time.substr(0, 4);
  const month = time.substr(4, 2);
  const day = time.substr(6, 2);
  const hour = time.substr(8, 2);
  const minute = time.substr(10, 2);
  const second = time.substr(12, 2);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
}

function loadContent(path) {
  return fs.readFileSync(path, 'utf8');
}

function processHtml(html) {
  return html.replace(/"http(s?):\/\/blog.odd-e.com\/(.*)\/(.*?)(-thumb.*?)?\.(.*?)"/g, '"https://localhost:8080/content/images/$3.$5"');
}

//console.log(processHtml('<p><img src="https://blog.odd-e.com/yilv/develop%20causal%20%26%20dynamic%20thinking.jpg" alt="1.jpg" /></p>'));
//console.log(processHtml('<p><img src="https://blog.odd-e.com/yilv/assets_c/2023/10/develop%20causal%20%26%20dynamic%20thinking-thumb-450xauto-577.jpg" alt="1.jpg" /></p>'));
//console.log(processHtml('<p><img src="http://blog.odd-e.com/basvodde/learning_scaling.jpg" alt="1.jpg" /></p>'));

function extractData(content) {
  let data = {
    posts: [],
    posts_authors: [],
    users: [
      {
        id: '9',
        name: 'Lv Yi',
        email: 'yi.lv@odd-e.com',
        created_at: '2012-01-19T13:49:15.000Z',
      }
    ],
  };
  const parser = new xml.Parser();
  parser.parseString(content, (err, result) => {
    for (let entry of result.movabletype.entry) {
      let post = {};
      post.id = entry.$.id;
      post.title = entry.$.title;
      post.status = "published";
      post.published_at = convertTimeFormat(entry.$.authored_on);
      // post.lexical = htmlToLexicalString(entry.text[0]);
      post.html = processHtml(entry.text[0]);
      data.posts.push(post);

      let user = data.users.find((user) => user.id === entry.$.author_id);
      if (!user) {
        let author = result.movabletype.author.find((author) => author.$.id === entry.$.author_id);
        user = {};
        user.id = author.$.id;
        user.name = author.$.nickname;
        user.email = author.$.email;
        user.created_at = convertTimeFormat(author.$.created_on);
        data.users.push(user);
      }

      let post_author = {};
      post_author.post_id = post.id;
      post_author.author_id = user.id;
      data.posts_authors.push(post_author);
    }
  });
  return data;
}

function renameImages(backupDir) {
  fs.readdir(backupDir, (err, files) => {
    if (err) return console.error(err);
    files.forEach((file) => {
      if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
        const newFile = file.replace(/^\d{1,4}-/, '');
        const origPath = path.join(backupDir, file)
        const newFilePath = path.join(backupDir, newFile)
        fs.rename(origPath, newFilePath, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(origPath, '->', newFilePath);
          }
        });
      }
    })
  })
}
