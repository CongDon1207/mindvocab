# Vocabulary import format

MindVocab accepts either an Excel `.xlsx` file or a Markdown table pasted from ChatGPT. Use exactly these ten columns, in this exact order:

```text
word | meaning_vi | pos | ipa | note | ex1_en | ex1_vi | ex2_en | ex2_vi | fill_en
```

`ipa` and `note` may be blank. Every other column is required. `pos` must be one of `noun`, `verb`, `adj`, `adv`, `prep`, `phrase`, `idiom`, or `other`.

The three English sentences must all be different and contain the vocabulary item exactly once. `fill_en` is used only in the Fill Blank study step and must contain 7 to 18 words.

Excel imports read the first worksheet only; use the first row as the header and do not merge cells. Markdown imports must include the header row and may include the normal Markdown alignment row.

Before saving, the import dialog previews invalid rows and duplicates. Choose whether an existing word is skipped, completed only where fields are blank, or overwritten while retaining its SRS progress.
