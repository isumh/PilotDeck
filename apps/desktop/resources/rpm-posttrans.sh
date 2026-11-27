#!/bin/sh
# Releases with electron-builder's default postun remove the new launcher on
# upgrade. Repair it after all old-package scriptlets have finished as well.
if [ -x '/opt/EastYunDesk/eastyundesk-desktop' ]; then
  if type update-alternatives >/dev/null 2>&1; then
    update-alternatives --install '/usr/bin/eastyundesk-desktop' 'eastyundesk-desktop' '/opt/EastYunDesk/eastyundesk-desktop' 100
  else
    ln -sf '/opt/EastYunDesk/eastyundesk-desktop' '/usr/bin/eastyundesk-desktop'
  fi
fi
