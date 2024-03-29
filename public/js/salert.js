import 'https://cdn.jsdelivr.net/npm/sweetalert2@11'

export function erroralert(message) {

    let Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
              
      Toast.fire({
        icon: 'error',
        title: message
      });

}

export function successalert(message, callback = null, time = 2000) {

    let Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: time,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
              
    Toast.fire({
        icon: 'success',
        title: message
    }).then(function() {
        if (callback) {
          callback();
        }
    });

}