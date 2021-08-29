export default function (csv) {
  const lines = csv.split("\n");
  const headers = lines.shift().split(',');

  if (lines[lines.length -1].length <= 0) lines.pop(); // remove empty last line;

  return lines.map((line, i) => {
    return headers.reduce((result, val, j) => {
      const cols = line.split(',');

      result[headers[j]] = cols[j];

      return result;
    }, {});
  });
}