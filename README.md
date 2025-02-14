# ShareCopyJS

A lightweight JS package that enables sharing text using the Web Share API on mobile devices, with a fallback to copying text on devices that do not support sharing.

## Features

- **Mobile Sharing:** Uses the native Web Share API on mobile devices.
- **Clipboard Copying:** Automatically copies text if sharing isn’t supported.
- **Fallback Support:** Uses a temporary textarea element when necessary.

## Installation

```bash
npm install sharecopyjs
```

## Usage

### Share or Copy Text

```ts
import { shareCopy, ShareCopyParams } from 'sharecopyjs';

const params: ShareCopyParams = {
  text: 'Check out this awesome content!',
  title: 'Awesome Content',
  url: 'https://example.com',
  onSuccess: (action) => console.log(`Successfully executed ${action}`),
  onFail: (error, action) =>
    console.error(`Failed to execute ${action}:`, error),
};

shareCopy(params);
```

### Check Sharing Availability (canShare)
> Use the `canShare` function to check if the Web Share API is available:

```ts
import { canShare } from 'sharecopyjs';

if (canShare()) {
  console.log('Display share icon');
} else {
  console.log('Display copy icon');
}
```

#### Why Use `canShare`?
- **Simple**: Focuses on whether the device supports **Web Share**.
- **Practical**: Helps you decide if a share button or fallback copy icon should be displayed.



## Screenshots
### Mobile View
![Mobile Screenshot](https://github.com/kingflamez/sharecopyjs/raw/main/SCREENSHOTS/Mobile1.jpg)
Brings up the share tray

### Web View
![Web Screenshot](https://github.com/kingflamez/sharecopyjs/raw/main/SCREENSHOTS/Web1.jpg)
Copies to clipboard
