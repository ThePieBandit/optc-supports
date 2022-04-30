fetch('CHANGELOG.md')
  .then(response => response.text())
  .then(text => {
    const tokens = marked.lexer(text);
    const versionString = tokens.find(entry => entry.type == "heading" && entry.depth == 3).text;
    $('.version-info').append(`<span data-toggle="modal" data-target="#changelogModal"><label id="changelogtoggle">v${versionString}</label></span>`);
    return marked.parse(text);
  })
  .then(text => {
    $('#changelog').append(text);
  });
