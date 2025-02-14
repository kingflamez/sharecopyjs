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

## Screenshots
### Mobile View
![Mobile Screenshot 1](./SCREENSHOTS/Mobile1.jpg)
![Mobile Screenshot 2](./SCREENSHOTS/Mobile2.jpg)
![Mobile Screenshot 3](./SCREENSHOTS/Mobile3.jpg)

### Web View
![Web Screenshot 1](./SCREENSHOTS/Web1.jpg)
![Web Screenshot 2](./SCREENSHOTS/Web2.jpg)