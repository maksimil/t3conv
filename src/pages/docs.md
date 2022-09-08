---
layout: "@layouts/Docs.astro"
---

# hysteresis.online docs

**t3conv** is a tool for processing data from LS7400VSM and Princeton

## Main page

On the main page you can see a links to **docs** (this page) and **github <3** (to the github repo of this project). Under them you can see 2 buttons: the first one specifies the type of your file. After selecting the file type you can press the **Open file** file button to open the file. Also t3conv supports history of the files. Simply press the history item to open it.

## View page

On the view page you can see the upper row with buttons, a side bar with the data, parsed from the file, and a graph of this data.

### Open

Move to the main page.

### Show meta

Shows metadata of the input file.

### Convert

Opens the conversion window. Choose units for **Field** and **Momentum** and press **Convert**.

### Hide totalM

Hides the **TotalM** from the graph (the orange curve).

### Normalize

Opens the normalization window. Specify the values for mass and volume. To enable normalization by mass press the **Mass** label. To enable normalization by volume press the **Volume** label. Press **Normalize** to apply changes.

### Line mode

Opens the line mode window. Press the **lines** label to switch showing lines on the graph. Press the **markers** label to switch showing markers on the graph.

### Export csv

Opens the export window. Specify the filename and then press **Export** to export the data in csv format with all the formatting (normalization, conversion). You can also press the label **Filename** to reset filename to the default one (name of the input file + .csv).
