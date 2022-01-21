const fs = require('fs')
const path = require('path')
const express = require('express')
const ReactDOMServer = require('react-dom/server');
const { createServer: createViteServer } = require('vite')

const middleware = (req, res, next) => {
  console.log('nice');
  next();
}

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' }
  })
  app.use(vite.middlewares)
  app.use('/hen',async (req, res, next) => {
    middleware(req,res,next);
  });
  app.use('*', async (req, res) => {
    const url = req.originalUrl
  
    try {
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      )
  
      template = await vite.transformIndexHtml(url, template)
  
      const render  = ReactDOMServer.renderToString
  
      const appHtml = await render(url)
  
      const html = template.replace(`<!--ssr-outlet-->`, appHtml)
  
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })
  console.log('server started')
  app.listen(3000)
}

createServer()