import Swal, { type SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

type AlertOptions = {
  title?: string;
  text: string;
  icon?: SweetAlertIcon;
};

type ConfirmOptions = {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
};

const baseAlertOptions = {
  background: '#101010',
  color: '#ffffff',
  confirmButtonColor: '#f4f1ea',
  confirmButtonText: 'OK',
  customClass: {
    popup: 'sofnu-swal-popup',
    confirmButton: 'sofnu-swal-confirm',
    cancelButton: 'sofnu-swal-cancel',
  },
};

function defaultTitle(icon: SweetAlertIcon) {
  if (icon === 'success') return 'Berhasil';
  if (icon === 'error') return 'Gagal';
  if (icon === 'warning') return 'Perhatian';
  return 'Informasi';
}

export function showSweetAlert({ title, text, icon = 'info' }: AlertOptions) {
  void Swal.fire({
    ...baseAlertOptions,
    icon,
    title: title || defaultTitle(icon),
    text,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: true,
  });
}

export function showSuccessAlert(text: string, title = 'Berhasil') {
  showSweetAlert({ title, text, icon: 'success' });
}

export function showErrorAlert(text: string, title = 'Gagal') {
  showSweetAlert({ title, text, icon: 'error' });
}

export function showInfoAlert(text: string, title = 'Informasi') {
  showSweetAlert({ title, text, icon: 'info' });
}

export function showWarningAlert(text: string, title = 'Perhatian') {
  showSweetAlert({ title, text, icon: 'warning' });
}

export async function confirmSweetAlert({
  title,
  text,
  confirmButtonText = 'OK',
  cancelButtonText = 'Batal',
  icon = 'warning',
}: ConfirmOptions) {
  const result = await Swal.fire({
    ...baseAlertOptions,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#303030',
    focusCancel: true,
    reverseButtons: true,
  });

  return result.isConfirmed;
}
