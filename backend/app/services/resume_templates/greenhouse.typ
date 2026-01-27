// Greenhouse ATS-Optimized Resume Template
// Structured sections for database field mapping, semantic matching support
// Optimized for single page output

#set page(
  paper: "us-letter",
  margin: (x: 0.5in, y: 0.4in),
)

#set text(
  font: "Calibri",
  size: 9.5pt,
  hyphenate: false,
)

#set par(
  justify: false,
  leading: 0.5em,
)

// Contact Section - Structured format for field extraction
#align(center)[
  #text(size: 15pt, weight: "bold")[#name]
  #v(3pt)
  #text(size: 9pt)[
    #email
    #h(6pt) | #h(6pt)
    #phone
    #h(6pt) | #h(6pt)
    #location
    #if linkedin != none [
      #h(6pt) | #h(6pt)
      #linkedin
    ]
  ]
]

#v(8pt)

// Professional Summary - Keyword-rich for semantic matching
#if summary != none [
  #text(weight: "bold", size: 10pt, fill: rgb("#333"))[Professional Summary]
  #line(length: 100%, stroke: 0.8pt + rgb("#333"))
  #v(3pt)
  #text(size: 9pt)[#summary]
  #v(6pt)
]

// Experience Section - Structured for data extraction
#text(weight: "bold", size: 10pt, fill: rgb("#333"))[Experience]
#line(length: 100%, stroke: 0.8pt + rgb("#333"))
#v(3pt)

#for exp in experience [
  #grid(
    columns: (1fr, auto),
    gutter: 4pt,
    [
      #text(weight: "bold", size: 9.5pt)[#exp.title]
      #text(size: 9pt, style: "italic")[ — #exp.company]#if exp.location != none [#text(size: 9pt)[, #exp.location]]
    ],
    [#text(size: 9pt)[#exp.start_date – #exp.end_date]]
  )
  #v(2pt)
  #for bullet in exp.bullets [
    #text(size: 9pt)[• #bullet]
    #v(0.5pt)
  ]
  #v(4pt)
]

// Education Section - Structured fields
#text(weight: "bold", size: 10pt, fill: rgb("#333"))[Education]
#line(length: 100%, stroke: 0.8pt + rgb("#333"))
#v(3pt)

#for edu in education [
  #grid(
    columns: (1fr, auto),
    gutter: 4pt,
    [
      #text(weight: "bold", size: 9.5pt)[#edu.degree]
      #text(size: 9pt, style: "italic")[ — #edu.institution]#if edu.location != none [#text(size: 9pt)[, #edu.location]]
      #if edu.gpa != none [#text(size: 9pt)[ | GPA: #edu.gpa]]
    ],
    [#if edu.graduation_date != none [#text(size: 9pt)[#edu.graduation_date]]]
  )
  #v(2pt)
]

// Skills Section - Categorized for easy extraction
#v(2pt)
#text(weight: "bold", size: 10pt, fill: rgb("#333"))[Skills]
#line(length: 100%, stroke: 0.8pt + rgb("#333"))
#v(3pt)

#if skills.technical.len() > 0 [
  #text(size: 9pt)[#text(weight: "bold")[Technical:] #skills.technical.join(", ")]
  #v(1pt)
]

#if skills.tools.len() > 0 [
  #text(size: 9pt)[#text(weight: "bold")[Tools:] #skills.tools.join(", ")]
  #v(1pt)
]

#if skills.soft.len() > 0 [
  #text(size: 9pt)[#text(weight: "bold")[Additional:] #skills.soft.join(", ")]
]
