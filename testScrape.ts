async function main() {
  const folderId = "16VupFnjSJm8R5h8iXGaWEJVDkzBHGLQg";
  const folderWebUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const res = await fetch(folderWebUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const text = await res.text();
  console.log("Title tag:", text.match(/<title>([^<]+)<\/title>/)?.[1]);
  
  // Let's see if the word "SignIn" or "login" is present
  console.log("Has 'signIn':", text.toLowerCase().includes("signin"));
  console.log("Has 'login':", text.toLowerCase().includes("login"));
  console.log("Has 'reception':", text.toLowerCase().includes("reception"));

  // Check for any 33-char alphanumeric strings resembling Google Drive IDs
  const idRegex = /[a-zA-Z0-9_-]{33}/g;
  const matches = text.match(idRegex) || [];
  console.log("Found", matches.length, "potential 33-char IDs");
  if (matches.length > 0) {
    console.log("Sample 33-char IDs:", matches.slice(0, 10));
  }
}
main().catch(console.error);
