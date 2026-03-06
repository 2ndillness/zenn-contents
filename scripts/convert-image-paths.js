const fs = require("fs");
const glob = require("glob");

// 対象ディレクトリ（articles / books）
const TARGET_DIRS = ["articles/**/*.md", "books/**/*.md"];

const REL_IMG_REGEX = /(!\[[^\]]*\]\()(\.{1,}\/)+images\/([^)\s]+)(\))/g;

//画像パスを変換
const convertImagePaths = (text) => {
  const lines = text.split("\n");
  let inCodeBlock = false;
  const result = [];
  // コードブロックフェンス
  const FENCE_REGEX = /^ {0,3}(`{3,}|~{3,}).*$/;

  for (let line of lines) {
    // コードブロックの開始/終了かを判定
    if (FENCE_REGEX.test(line)) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue; // フェンス行自体は置換対象外
    }

    // コードブロック外の場合のみパスを置換
    if (!inCodeBlock) {
      line = line.replace(
        REL_IMG_REGEX,
        (_m, prefix, _dots, filename, suffix) =>
          `${prefix}/images/${filename}${suffix}`,
      );
    }

    result.push(line);
  }

  return result.join("\n");
};

// ファイル単位の処理
const processFile = (filePath) => {
  const original = fs.readFileSync(filePath, "utf8");
  const converted = convertImagePaths(original);

  if (original !== converted) {
    fs.writeFileSync(filePath, converted, "utf8");
    console.log(`Converted: ${filePath}`);
  } else {
    console.log(`No change: ${filePath}`);
  }
};

// メイン処理
const main = () => {
  TARGET_DIRS.forEach((pattern) => {
    const files = glob.sync(pattern);
    files.forEach(processFile);
  });
};

main();