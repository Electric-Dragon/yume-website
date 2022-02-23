const inputOptions = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        '#ff0000': 'Web comic',
        '#00ff00': 'Web Novel',
      })
    }, 1000)
  })
  
  const { value: color } = await Swal.fire({
    title: 'Select color',
    input: 'radio',
    inputOptions: inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to choose something!'
      }
    }
  })
  
  if (color) {
    Swal.fire({ html: `You selected: ${color}` })
  }