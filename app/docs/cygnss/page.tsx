export default function CygnssDocsPage() {
  return (
    <div className="container mx-auto px-4 py-10 prose prose-sm max-w-3xl">
      <h1>CYGNSS Data: Setup & Download Guide</h1>
      <p>This quick guide explains how to fetch CYGNSS Level-1 NetCDF files and use them in this app.</p>
      <h2>Steps</h2>
      <ol>
        <li>Create a free NASA Earthdata account.</li>
        <li>Install <code>podaac-data-downloader</code> (pip or conda).</li>
        <li>Download <code>.nc</code> files into your project's <code>data/</code> folder.</li>
      </ol>
      <h2>More details</h2>
      <p>See <code>CYGNSS_INTEGRATION.md</code> and <code>REAL_DATA_GUIDE.md</code> in the repository for commands and sample code.</p>
    </div>
  )
}
