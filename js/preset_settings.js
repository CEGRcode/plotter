const presetSettings = [
    {
        name: "Rossi et al. 2021",
        globalSettings: {
            opacity: 1,
            smoothing: 21,
            bpShift: 50,
            combined: false,
            separateColors: false,
            colorTrace: false
        },
        compositeData: [
            {primaryColor: "#FFF100"},
            {primaryColor: "#FF8C00"},
            {primaryColor: "#E81123"},
            {primaryColor: "#EC008C"},
            {primaryColor: "#68217A"},
            {primaryColor: "#00188F"},
            {primaryColor: "#00BCF2"},
            {primaryColor: "#00B294"},
            {primaryColor: "#009E49"},
            {primaryColor: "#BAD80A"}
        ]
    },
    {
        name: "Mittal et al. 2022",
        globalSettings: {
            opacity: 1,
            smoothing: 31,
            bpShift: 0,
            combined: false,
            separateColors: false,
            colorTrace: false
        },
        compositeData: [
            {primaryColor: "#BFBFBF"},
            {primaryColor: "#000000"},
            {primaryColor: "#FF0000"},
            {primaryColor: "#FF9100"},
            {primaryColor: "#D7D700"},
            {primaryColor: "#07E200"},
            {primaryColor: "#00B0F0"},
            {primaryColor: "#0007FF"},
            {primaryColor: "#A700FF"},
            {primaryColor: "#FF00D0"}
        ]
    },
    {
        name: "Benzonase",
        globalSettings: {
            opacity: 1,
            smoothing: 7,
            bpShift: 0,
            combined: false,
            separateColors: true,
            colorTrace: false
        },
        compositeData: [
            {name: "Read 1", primaryColor: "#1331F5", secondaryColor: "#E93323"},
            {name: "Read 2", primaryColor: "#4EADEA", secondaryColor: "#EB50F7"}
        ]
    }
]