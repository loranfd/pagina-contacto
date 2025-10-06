document.addEventListener('DOMContentLoaded', () => {

  function mapearCampos(data) {
    const mapeo = {
      'origen-contacto': 'procedencia-contacto',
      'origen-otros-text': 'como-conocido-otros',
      'ubicacion': 'ubicacion-terreno',
      'cualidades': 'checkbox-374'
    };
  
    const resultado = {};
    for (const key in data) {
      if (mapeo[key]) {
        resultado[mapeo[key]] = data[key];
      } else {
        resultado[key] = data[key];
      }
    }
    return resultado;
  }
  
  const apiUrl = 'https://script.google.com/macros/s/AKfycbzhw3QMxMyVBuSzbabj8wPc5hm5X75AODXqz7Kn737rn46G670fl844EWLhy0G13bc/exec';
  let datosGuardados = null;
  
  // Elementos que quieres controlar
  const cualidadOtrosCheckbox = document.getElementById('cualidad-otros');
  const cualidadesOtrosContainer = document.getElementById('cualidades-otros-container');
  const origenSelect = document.getElementById('origen-contacto');
  const origenOtrosContainer = document.getElementById('origen-otros-container');
  const formCompletoContainer = document.getElementById('form-completo');
  const viviendaInteresadaContainer = document.getElementById('vivienda-interesada-container');
  const interesSelect = document.getElementById('interes');
  const interesOtrosContainer = document.getElementById('interes-otros-container');
  const terrenoSelect = document.getElementById('terreno');
  const ubicacionContainer = document.getElementById('ubicacion-container');
  
  // Mostrar / ocultar "Otros" cualidades
  cualidadOtrosCheckbox.addEventListener('change', () => {
    cualidadesOtrosContainer.style.display = cualidadOtrosCheckbox.checked ? 'block' : 'none';
    if (!cualidadOtrosCheckbox.checked) document.getElementById('cualidades-otros').value = '';
  });
  
  // Mostrar / ocultar "Otros" origen contacto
  origenSelect.addEventListener('change', () => {
    origenOtrosContainer.style.display = origenSelect.value === 'Otros' ? 'block' : 'none';
    if (origenSelect.value !== 'Otros') {
      document.getElementById('origen-otros-text').value = '';
    }
    // Aquí no ocultamos formulario, origen siempre visible
  });
  
  // Mostrar / ocultar "Otros" interes
  interesSelect.addEventListener('change', () => {
    if (interesSelect.value === 'Otros') {
      interesOtrosContainer.style.display = 'block';
    } else {
      interesOtrosContainer.style.display = 'none';
      document.getElementById('interes-otros').value = '';
    }
  
    if (interesSelect.value === 'Villas isla de Cortegada') {
      formCompletoContainer.style.display = 'none';
      viviendaInteresadaContainer.style.display = 'block';
    } else {
      formCompletoContainer.style.display = 'block';
      viviendaInteresadaContainer.style.display = 'none';
    }
  });
  
  // Mostrar / ocultar ubicación terreno
  terrenoSelect.addEventListener('change', () => {
    ubicacionContainer.style.display = terrenoSelect.value === 'No' ? 'none' : 'block';
    if (terrenoSelect.value === 'No') document.getElementById('ubicacion').value = '';
  });
  
  // Actualizar barra superior con nombre y fecha
  const updateNavBar = () => {
    document.getElementById('nav-nombre').textContent = `Nombre: ${document.getElementById('nombre').value || '-'}`;
    document.getElementById('nav-fecha').textContent = `Fecha: ${document.getElementById('fecha').value || '-'}`;
  };
  document.getElementById('nombre').addEventListener('input', updateNavBar);
  document.getElementById('fecha').addEventListener('input', updateNavBar);
  
  // Guardar datos evento
  document.getElementById('guardarDatos').addEventListener('click', async () => {
    const formData = new FormData(document.getElementById('form-ficha'));
    const dataToSend = {};
  
    for (let [key, value] of formData.entries()) {
      if (key === 'cualidades') {
        dataToSend[key] = dataToSend[key] ? dataToSend[key] + ', ' + value : value;
      } else if (key === 'origen-contacto') {
        dataToSend['origen-contacto'] = value;
        if (value === 'Otros') dataToSend['origen-otros-text'] = document.getElementById('origen-otros-text').value.trim();
      } else {
        dataToSend[key] = value;
      }
    }
  
    dataToSend['interes'] = document.getElementById('interes').value;
    if (dataToSend['interes'] === 'Otros') {
      dataToSend['interes-otros'] = document.getElementById('interes-otros').value.trim();
    }
	
	
	
  
    dataToSend['origen-contacto'] = dataToSend['origen-contacto'] || '—';
    dataToSend['vivienda-interesada'] = dataToSend['vivienda-interesada'] || '—';
    dataToSend['source'] = 'crearficha';
    dataToSend['ID'] = '';
	// Estudio de viabilidad
	dataToSend['estudio-viabilidad'] = document.getElementById('estudio-viabilidad')?.value || '';
  
    const dataMapeada = mapearCampos(dataToSend);
  
    console.log('Datos enviados al servidor:', dataMapeada);
  
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(dataMapeada)
      });
      const result = await resp.json();
      console.log('Respuesta del servidor:', result);
      if (result.status === 'success') {
        alert('Ficha creada correctamente');
        datosGuardados = dataToSend;
        document.getElementById('exportarWord').disabled = false;
        updateNavBar();
      } else {
        alert('Error al guardar: ' + (result.message || result));
      }
    } catch (err) {
      console.error('Error al enviar datos:', err);
      alert('Error al guardar ficha: ' + err.message);
    }
  });
  
 // Exportar a Word
// Función para generar el documento Word con formato estilizado (igual que en ficha.js)
const generarDocumentoWord = async (datosGuardados) => {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = window.docx;

  const formatearFecha = fecha => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return isNaN(d) ? '-' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const textoALista = texto => {
    if (!texto) return ['-'];
    return texto.split(',').map(i => i.trim()).filter(Boolean);
  };

  const camposFecha = ['Fecha', 'date-33', 'fecha-llamada', 'fecha-mail', 'fecha-reunion'];
  const camposLista = ['cualidades'];
  const camposMultilinea = [
    'coherencia-dormitorios', 'coherencia-presupuesto', 'descripcion-vivienda', 'estancia-adicional',
    'presupuesto-deseado', 'viabilidad', 'informacion-adicional', 'info-enviada', 'imprescindible', 'Notas'
  ];

  const crearFilasTabla = (label, key, otrosKey = null, valorFijo = null) => {
    const valorOriginal = valorFijo || datosGuardados[key] || '-';
    const valorOtros = otrosKey ? datosGuardados[otrosKey] || '' : '';
    const labelCell = new TableCell({
      children: [ new Paragraph({ children: [ new TextRun({ text: `${label}:`, bold: true, color: '849901' }) ] }) ],
      width: { size: 30, type: WidthType.PERCENTAGE }
    });

    if (camposFecha.includes(key)) {
      return [ new TableRow({ children: [ labelCell, new TableCell({ children: [ new Paragraph({ text: formatearFecha(valorOriginal), children: [new TextRun({ color: '6B7C01' })] }) ], width: { size: 70, type: WidthType.PERCENTAGE } }) ] }) ];
    }

    if (camposLista.includes(key)) {
      const items = textoALista(valorOriginal);
      const filas = [ new TableRow({ children: [ labelCell, new TableCell({ children: items.map(i => new Paragraph({ text: `• ${i}`, children: [new TextRun({ color: '6B7C01' })] })), width: { size: 70, type: WidthType.PERCENTAGE } }) ] }) ];
      if (otrosKey && valorOtros && items.includes('Otros')) filas.push(new TableRow({ children: [ new TableCell({ children: [] }), new TableCell({ children: [ new Paragraph({ text: `• ${valorOtros}`, children: [new TextRun({ color: '6B7C01' })] }) ] }) ] }));
      return filas;
    }

    if (camposMultilinea.includes(key)) {
      const lines = valorOriginal.split('\n').filter(Boolean);
      return [ new TableRow({ children: [ labelCell, new TableCell({ children: lines.length ? lines.map(l => new Paragraph({ text: l, children: [new TextRun({ color: '6B7C01' })] })) : [ new Paragraph({ text: '-', children: [new TextRun({ color: '6B7C01' })] }) ] }) ] }) ];
    }

    return [ new TableRow({ children: [ labelCell, new TableCell({ children: [ new Paragraph({ text: valorOriginal, children: [new TextRun({ color: '6B7C01' })] }) ], width: { size: 70, type: WidthType.PERCENTAGE } }) ] }) ];
  };

  let secciones = [];

  if (datosGuardados['interes'] === 'Villas isla de Cortegada') {
    secciones = [
      {
        titulo: 'VILLAS ISLA DE CORTEGADA',
        campos: [
          ['Nombre/s', 'your-name'],
          ['Correo electrónico', 'your-email'],
          ['Teléfono', 'tel-686'],
          ['Procedencia del contacto', 'origen-contacto', 'origen-otros-text'],
          ['Vivienda interesada', 'vivienda-interesada'],
          ['Notas adicionales', 'Notas']
        ]
      }
    ];
  } else {
    secciones = [
      {
        titulo: 'DATOS VÍA WEB O VÍA MAIL',
        subtitulo: 'A medida de tus sueños',
        campos: [
          ['Nombre/s', 'your-name'],
          ['Correo electrónico', 'your-email'],
          ['Teléfono', 'tel-686'],
          ['¿Qué cualidades buscas en tu vivienda?', 'cualidades', 'cualidades-otros'],
        ]
      },
      {
        subtitulo: 'A medida de tus posibilidades',
        campos: [
          ['Dispones de terreno', 'terreno'],
          ['Ubicación del terreno', 'ubicacion'],
          ['Inversión estimada', 'number-419'],
          ['Plazo o fecha deseada', 'date-33'],
        ]
      },
      {
        subtitulo: 'A medida de tus necesidades',
        campos: [
          ['Número de plantas', 'number-420'],
          ['Superficie de la vivienda', 'number-421'],
          ['Número de dormitorios', 'number-422'],
          ['Número de baños', 'number-423'],
        ]
      },
      {
        subtitulo: 'Análisis inicial',
        campos: [
          ['Coherencia nº dormitorios y superficie', 'coherencia-dormitorios'],
          ['Coherencia superficie y presupuesto', 'coherencia-presupuesto'],
        ]
      },
      {
        titulo: 'LLAMADA 01',
        campos: [
          ['¿Cómo nos has conocido?', 'como-conocido', 'como-conocido-otros'],
          ['Descripción vivienda', 'descripcion-vivienda'],
          ['Distribución zona de día', 'distribucion-dia'],
          ['Garaje', 'garaje'],
          ['Piscina', 'piscina'],
          ['Estancia adicional', 'estancia-adicional'],
          ['Superficie de la parcela', 'superficie-parcela'],
          ['Edificabilidad', 'edificabilidad'],
          ['Ocupación', 'ocupacion'],
          ['Referencia catastral', 'referencia-catastral'],
          ['Presupuesto deseado', 'presupuesto-deseado'],
          ['Comentar viabilidad nº D - Superficie - €', 'viabilidad'],
          ['Información adicional', 'informacion-adicional'],
        ]
      },
      {
        titulo: 'MAIL 01',
        campos: [
          ['Detallar información enviada', 'info-enviada'],
        ]
      },
      {
        titulo: 'REUNIÓN ESTUDIOS PREVIOS',
        campos: [
          ['Imprescindible', 'imprescindible'],
        ]
      },
      {
        titulo: 'NOTAS',
        campos: [
          ['Notas adicionales', 'Notas']
        ]
      }
    ];
  }

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'CUESTIONARIO 2025',
                bold: true,
                size: 48,
                font: 'Calibri',
                color: '849901'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 400 }
          }),
          ...secciones.flatMap(seccion => {
            const elementos = [];
            if (seccion.titulo) {
              elementos.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: seccion.titulo,
                      bold: true,
                      size: 26,
                      font: 'Calibri',
                      color: '849901'
                    })
                  ],
                  spacing: { before: 600, after: 300 }
                })
              );
            }
            if (seccion.subtitulo) {
              elementos.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: seccion.subtitulo,
                      bold: true,
                      size: 22,
                      font: 'Calibri',
                      color: '6B7C01',
                      italics: true
                    })
                  ],
                  spacing: { before: 400, after: 200 }
                })
              );
            }
            const tableRows = seccion.campos.flatMap(([label, key, otrosKey, valorFijo]) => {
              if (key === 'ubicacion' && datosGuardados['terreno'] === 'No') return [];
              if (key === 'cualidades-otros' && !datosGuardados['cualidades']?.includes('Otros')) return [];
              if (key === 'origen-otros-text' && datosGuardados['origen-contacto'] !== 'Otros') return [];
              if (key === 'como-conocido-otros' && datosGuardados['como-conocido'] !== 'Otros') return [];
              return crearFilasTabla(label, key, otrosKey, valorFijo);
            });
            if (tableRows.length > 0) {
              elementos.push(
                new Table({
                  rows: tableRows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                    left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                    right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'EEEEEE' },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' }
                  }
                }),
                new Paragraph({
                  text: '',
                  spacing: { before: 0, after: 300 }
                })
              );
            }
            return elementos;
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
};

// Exportar a Word
document.getElementById('exportarWord').addEventListener('click', async () => {
  if (!datosGuardados) return alert('Primero guarda los datos.');
  if (!window.docx) return alert('Librería docx no cargada.');

  const blob = await generarDocumentoWord(datosGuardados);
  const fecha = new Date();
  saveAs(blob, `cuestionario_${(datosGuardados['your-name'] || 'sin_nombre').replace(/\s+/g,'_')}_${fecha.getDate()}_${fecha.getMonth() + 1}_${fecha.getFullYear()}.docx`);
});

// Exportar con Carpeta (ZIP)
document.getElementById('exportarZip').addEventListener('click', async () => {
  if (!datosGuardados) return alert('Primero guarda los datos.');
  if (!window.docx) return alert('Librería docx no cargada.');
  if (!window.JSZip) return alert('Librería JSZip no cargada.');

  const blob = await generarDocumentoWord(datosGuardados);
  let nombrePersona = (datosGuardados['your-name'] || 'SIN_NOMBRE').toUpperCase();
  let zipFileName;
  if (datosGuardados['interes'] === 'Villas isla de Cortegada') {
    zipFileName = `${nombrePersona} (PROMO VILLA).zip`;
  } else {
    let ubicacion = datosGuardados['ubicacion'] || 'SIN_UBICACION';
    zipFileName = `${nombrePersona} (${ubicacion.toUpperCase()}).zip`;
  }
  zipFileName = zipFileName.replace(/[/\\?%*:|"<>]/g, '_');
  const fecha = new Date();
  const docxFileName = `cuestionario_${nombrePersona.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}_${fecha.getDate()}_${fecha.getMonth() + 1}_${fecha.getFullYear()}.docx`;
  const zip = new JSZip();
  zip.file(docxFileName, blob);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, zipFileName);
});














  const fechaHoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').value = fechaHoy;
  
  
  // Iconos SVG para botón copiar y tick
const copiarSVG = `
  <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="7" width="9" height="9" rx="2" fill="#ECF0F1" stroke="#BDC3C7" stroke-width="1.5"/>
    <rect x="4" y="4" width="9" height="9" rx="2" fill="#ECF0F1" stroke="#95A5A6" stroke-width="1.2"/>
  </svg>
`;
const tickSVG = `
  <svg width="25" height="25" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11.3L9.15 14.5L14.2 8.5" stroke="#2ECC71" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

// Elementos
const btnCopiarRef = document.getElementById('btnCopiarRef');
const inputRefCat = document.getElementById('referencia-catastral');
const btnAbrirMapa = document.getElementById('btnAbrirMapa');

// Inicializar icono copiar
if (btnCopiarRef) btnCopiarRef.innerHTML = copiarSVG;

// Evento para copiar referencia
if (btnCopiarRef) {
  btnCopiarRef.addEventListener('click', () => {
    const ref = inputRefCat.value.trim();
    if (!ref) return;
    if (navigator.clipboard && navigator.clipboard.write) {
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([ref], { type: 'text/plain' }),
      });
      navigator.clipboard.write([clipboardItem]).then(() => {
        btnCopiarRef.innerHTML = tickSVG;
        setTimeout(() => {
          btnCopiarRef.innerHTML = copiarSVG;
        }, 1500);
      }).catch(() => {
        fallbackCopy(ref);
      });
    } else {
      fallbackCopy(ref);
    }
  });
}

// Evento para abrir mapa
if (btnAbrirMapa) {
  btnAbrirMapa.addEventListener('click', (e) => {
    e.preventDefault();
    window.open("https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?buscar=S", '_blank');
  });
}

// Método fallback de copiar texto clásico
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    btnCopiarRef.innerHTML = tickSVG;
    setTimeout(() => {
      btnCopiarRef.innerHTML = copiarSVG;
    }, 1500);
  } catch (e) {
    console.error('No se pudo copiar la referencia', e);
  }
  document.body.removeChild(textarea);
}
  
  
  updateNavBar();
  
});
