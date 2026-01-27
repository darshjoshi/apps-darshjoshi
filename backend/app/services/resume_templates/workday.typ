// Workday ATS-Optimized Resume Template
// Single column, no tables/graphics, standard headings, OCR-friendly

#set page(
  paper: "us-letter",
  margin: (x: 0.5in, y: 0.5in),
)

#set text(
  font: "Arial",
  size: 10pt,
  hyphenate: false,
)

#set par(
  justify: false,
  leading: 0.65em,
)

// Contact Section - Standard format for Workday parsing
#align(center)[
  #text(size: 16pt, weight: "bold")[#name]

  #v(2pt)

  #text(size: 10pt)[#email #h(1em) #phone #h(1em) #location]

  #if linkedin != none [
    #v(2pt)
    #text(size: 10pt)[#linkedin]
  ]
]

#v(8pt)

// Summary Section
#if summary != none [
  #text(weight: "bold", size: 11pt)[SUMMARY]
  #line(length: 100%, stroke: 0.5pt)
  #v(4pt)
  #summary
  #v(8pt)
]

// Work Experience Section - Standard heading for Workday
#text(weight: "bold", size: 11pt)[WORK EXPERIENCE]
#line(length: 100%, stroke: 0.5pt)
#v(4pt)

#for exp in experience [
  #text(weight: "bold")[#exp.title] #h(1fr) #text(style: "italic")[#exp.start_date - #exp.end_date]

  #text(style: "italic")[#exp.company] #if exp.location != none [#h(1em) #exp.location]

  #v(2pt)

  #for bullet in exp.bullets [
    • #bullet

  ]

  #v(6pt)
]

// Education Section - Standard heading for Workday
#text(weight: "bold", size: 11pt)[EDUCATION]
#line(length: 100%, stroke: 0.5pt)
#v(4pt)

#for edu in education [
  #text(weight: "bold")[#edu.degree]
  #if edu.graduation_date != none [#h(1fr) #edu.graduation_date]

  #text(style: "italic")[#edu.institution]
  #if edu.location != none [#h(1em) #edu.location]

  #if edu.gpa != none [

    GPA: #edu.gpa
  ]

  #v(4pt)
]

// Skills Section - Comma-separated for easy parsing
#v(4pt)
#text(weight: "bold", size: 11pt)[SKILLS]
#line(length: 100%, stroke: 0.5pt)
#v(4pt)

#if skills.technical.len() > 0 [
  #text(weight: "bold")[Technical:] #skills.technical.join(", ")

]

#if skills.tools.len() > 0 [
  #text(weight: "bold")[Tools:] #skills.tools.join(", ")

]

#if skills.soft.len() > 0 [
  #text(weight: "bold")[Other:] #skills.soft.join(", ")
]
