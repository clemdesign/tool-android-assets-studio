# Ionic Android Assets Studio

This project provide a collection of tools to easily generate assets such as launcher icons and splash screens for your Ionic Android app.

This project is based on [Android Asset Studio](https://github.com/romannurik/AndroidAssetStudio).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Tools

### Launcher Icon generator

The basic tool to generate launcher icons for your Android app. It is similar to the tool provided by Android Studio.

### Splash Screen generator

A specific tool able to generate:

- Old splash screen format (for API < 31)
- New splash screen format (for API >= 31) [Documentation](https://developer.android.com/develop/ui/views/launch/splash-screen?hl=en)

### Notifications Icon generator

A basic tool to generate notification icons for your Android app.

### Actions Bar Icon generator

A basic tool to generate notification icons for your Android app.

## Configuration

You can configure the splash screen integration of app with the following snippets:

> In `android/app/src/main/res/values-v31/styles.xml`

```xml
    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <!-- ... -->
        <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon</item>
        <item name="android:windowSplashScreenBrandingImage">@drawable/splash_brand</item>
        <!-- ... -->
    </style>
```

> In `android/app/src/main/res/values/styles.xml`

```xml
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme.NoActionBar">
        <item name="android:background">@drawable/splash</item>
        <!-- ... -->
    </style>
```

