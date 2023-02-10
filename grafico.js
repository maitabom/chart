var ranges = [
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'k' }
];

var dataEmitidas = [
    { x: 1, valor: 2500.15, quant: 100 },
    { x: 2, valor: 3500.1, quant: 150 },
    { x: 3, valor: 4500.8, quant: 200 },
    { x: 4, valor: 100.8, quant: 50 },
    { x: 5, valor: 10500, quant: 80 },
];

var dataCanceladas = [
    { x: 1, valor: 2000, quant: 10 },
    { x: 2, valor: 3000, quant: 50 },
    { x: 3, valor: 4000, quant: 20 },
    { x: 4, valor: 500, quant: 20 },
    { x: 5, valor: 4200, quant: 150 },
];

var valoresEmitidos = dataEmitidas.map(e => e.valor);
var valoresCancelados = dataCanceladas.map(c => c.valor);

var maior = Math.max(Math.max(...valoresEmitidos), Math.max(...valoresCancelados));
var pivot = Math.round(maior / 1000);
var step = 1000;

pivot = pivot + 1;

var maximo = pivot * 1000;

if (maximo > 10000) {
    step = 2000;
} else if (maximo > 20000) {
    step = 4000;
}

function formatNumber(n) {
    for (var i = 0; i < ranges.length; i++) {
        if (n >= ranges[i].divider) {
            return (n / ranges[i].divider).toString() + ranges[i].suffix;
        }
    }
    return n;
}

const ctx = document.getElementById('myChart');

// Estrutura da Legenda
const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.style.display = 'flex';
        listContainer.style.justifyContent = 'center';
        listContainer.style.flexDirection = 'row';
        listContainer.style.margin = 0;
        listContainer.style.padding = 0;
        listContainer.style.fontFamily = 'Outfit, Arial, sans-serif';

        legendContainer.appendChild(listContainer);
    }

    return listContainer;
};

// Estrutura do Tooltip
const getOrCreateTooltip = (chart) => {
    let tooltipEl = chart.canvas.parentNode.querySelector('div');

    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.style.background = 'rgba(255, 255, 255, 0.9)';
        tooltipEl.style.borderRadius = '3px';
        tooltipEl.style.border = 'solid 2px #058DC7'
        tooltipEl.style.opacity = 1;
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';

        const table = document.createElement('table');
        table.style.margin = '0px';

        tooltipEl.appendChild(table);
        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    return tooltipEl;
};

// Função de chamada de Tooltip
const buildExternalTooltip = (context) => {
    const { chart, tooltip } = context;
    const tooltipEl = getOrCreateTooltip(chart);

    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    if (tooltip.body) {
        const titleLines = tooltip.title || [];
        const bodyLines = tooltip.body.map(b => b.lines);
        const afterLines = tooltip.body.map(a => a.after);

        const tableHead = document.createElement('thead');

        titleLines.forEach(title => {
            const tr = document.createElement('tr');
            tr.style.borderWidth = 0;

            const th = document.createElement('th');
            th.style.borderWidth = 0;
            th.style.textAlign = 'left';
            th.style.paddingBottom = '5px';
            th.style.fontFamily = 'Outfit, Arial, sans-serif'; //Fonte
            th.style.fontWeight = 'normal';
            th.style.color = '#000';
            const text = document.createTextNode(title);

            th.appendChild(text);
            tr.appendChild(th);
            tableHead.appendChild(tr);
        });

        const tableBody = document.createElement('tbody');

        bodyLines.forEach((body, i) => {
            const colors = tooltip.labelColors[i];
            var contentLineLabel = Array();
            var contentLineValue = Array();
            var contentAfterLabel = Array();
            var contentAfterValue = Array();

            body.forEach(function (texto) {
                let pivot = texto.split(' ');
                contentLineLabel.push(pivot[0]);
                contentLineValue.push(pivot[1]);
            });

            afterLines[i].forEach(function (texto) {
                let pivot = texto.split(' ');
                contentAfterLabel.push(pivot[0]);
                contentAfterValue.push(pivot[1]);
            });

            const trLines = document.createElement('tr');
            const trAfter = document.createElement('tr');

            trLines.style.backgroundColor = 'inherit';
            trLines.style.borderWidth = 0;
            trLines.style.fontFamily = 'Outfit, Arial, sans-serif'; //Fonte

            trAfter.style.backgroundColor = 'inherit';
            trAfter.style.borderWidth = 0;
            trAfter.style.fontFamily = 'Outfit, Arial, sans-serif'; //Fonte

            const tdLineLabel = document.createElement('td');
            const tdLineValue = document.createElement('td');
            const tdAfterLabel = document.createElement('td');
            const tdAfterValue = document.createElement('td');

            const lineLabel = document.createTextNode(contentLineLabel);
            const lineValue = document.createTextNode(contentLineValue);
            const afterLabel = document.createTextNode(contentAfterLabel);
            const afterValue = document.createTextNode(contentAfterValue);

            tdLineLabel.style.color = colors.backgroundColor;
            tdLineValue.style.color = '#000';
            tdLineValue.style.textAlign = 'right';
            tdAfterLabel.style.color = colors.backgroundColor;
            tdAfterValue.style.color = '#000';
            tdAfterValue.style.textAlign = 'right';

            tdLineLabel.appendChild(lineLabel);
            tdLineValue.appendChild(lineValue);
            tdAfterLabel.appendChild(afterLabel);
            tdAfterValue.appendChild(afterValue);

            trLines.appendChild(tdLineLabel);
            trLines.appendChild(tdLineValue);
            trAfter.appendChild(tdAfterLabel);
            trAfter.appendChild(tdAfterValue);
            tableBody.appendChild(trLines);
            tableBody.appendChild(trAfter);
        });

        const tableRoot = tooltipEl.querySelector('table');

        // Remove old children
        while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);
    }

    const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + 'px';
    tooltipEl.style.top = positionY + tooltip.caretY + 'px';
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
}

// Posicionador de Tooltip
Chart.Tooltip.positioners.positionExternal = function (elements, position) {
    if (!elements.length) {
        return false;
    }
    var offset = 0;

    if (elements[0].element.height / 2 > position.x) {
        offset = 20;
    } else {
        offset = -100;
    }
    return {
        x: position.x,
        y: position.y + offset
    }
};

// Criação de plugin de legenda
const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const ul = getOrCreateLegendList(chart, options.containerID);

        // Remove old legend items
        while (ul.firstChild) {
            ul.firstChild.remove();
        }

        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);

        items.forEach(item => {
            const li = document.createElement('li');
            li.style.alignItems = 'center';
            li.style.cursor = 'pointer';
            li.style.display = 'flex';
            li.style.flexDirection = 'row';
            li.style.marginLeft = '10px';

            li.onclick = () => {
                const { type } = chart.config;
                if (type === 'pie' || type === 'doughnut') {
                    // Pie and doughnut charts only have a single dataset and visibility is per item
                    chart.toggleDataVisibility(item.index);
                } else {
                    chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
                }
                chart.update();
            };

            // Color box
            const boxSpan = document.createElement('span');
            boxSpan.style.background = item.fillStyle;
            boxSpan.style.borderColor = item.strokeStyle;
            boxSpan.style.borderWidth = item.lineWidth + 'px';
            boxSpan.style.display = 'inline-block';
            boxSpan.style.height = '20px';
            boxSpan.style.marginRight = '10px';
            boxSpan.style.width = '20px';
            boxSpan.style.borderRadius = '50%';

            // Text
            const textContainer = document.createElement('p');
            textContainer.style.color = item.fontColor;
            textContainer.style.margin = 0;
            textContainer.style.padding = 0;
            textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

            const text = document.createTextNode(item.text);
            textContainer.appendChild(text);

            li.appendChild(boxSpan);
            li.appendChild(textContainer);
            ul.appendChild(li);
        });
    }
};

//Configurações gerais do gráfico
new Chart(ctx, {
    type: 'bar',
    responsive: true,
    data: {
        labels: ['1', '2', '3', '4', '5', '6'],
        datasets: [
            {
                label: 'Emitidas',
                data: dataEmitidas,
                backgroundColor: '#058DC7',
                borderWidth: 1,
                //barPercentage: 0.75
            },
            {
                label: 'Canceladas',
                data: dataCanceladas,
                backgroundColor: '#FC802A',
                borderWidth: 1,
                //barPercentage: 0.75
            },
        ]
    },
    plugins: [htmlLegendPlugin],
    options: {
        parsing: {
            yAxisKey: 'valor'
        },
        responsive: true,
        interaction: {
            intersect: true,
            mode: 'index',
        },
        scales: {
            y: {
                beginAtZero: true,
                max: maximo,
                ticks: {
                    stepSize: step,
                    font: {
                        family: 'Outfit, Arial, sans-serif',
                        size: 16
                    },
                    callback: function (value) {
                        return formatNumber(value);
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        family: 'Outfit, Arial, sans-serif',
                        size: 16
                    }
                }
            }
        },
        plugins: {
            htmlLegend: {
                containerID: 'legendChart'
            },
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
                position: 'positionExternal',
                external: buildExternalTooltip,
                callbacks: {
                    title: function (context) {
                        return 'Dia ' + context[0].label;
                    },
                    label: ((tooltipItem, data) => {
                        var formatter = new Intl.NumberFormat('pt-BR', {
                            style: 'decimal',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            currency: 'BRL'
                        });
                        const valor = formatter.format(tooltipItem.raw.valor);
                        if (tooltipItem.datasetIndex === 0)
                            return 'Emitidas: ' + valor
                        else if (tooltipItem.datasetIndex === 1)
                            return 'Canceladas: ' + valor
                    }),
                    afterLabel: ((tooltipItem, data) => {
                        console.log(tooltipItem)
                        const quant = tooltipItem.raw.quant;
                        if (tooltipItem.datasetIndex === 0)
                            return 'Quant.: ' + quant
                        else if (tooltipItem.datasetIndex === 1)
                            return 'Quant.: ' + quant
                    })
                }
            }
        }
    }
});