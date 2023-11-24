import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const Scripts = () => {
    const importMap = {
        imports: {
            'theoplayer/chromeless': 'https://cdn.theoplayer.com/dash/theoplayer/THEOplayer.chromeless.esm.js'
        }
    };
    return (
        <Head>
            {/* Modern browsers */}
            <script type="importmap">{JSON.stringify(importMap)}</script>
            {/* Import maps polyfill for browsers without import maps support (e.g. Safari 16.3) */}
            <script async src="https://ga.jspm.io/npm:es-module-shims@1.8.0/dist/es-module-shims.js" crossOrigin="anonymous"></script>
            <script type="module" src="https://theoplayer.github.io/web-ui/dist/THEOplayerUI.mjs"></script>
            {/* Legacy browsers */}
            <script noModule src="https://polyfill.io/v3/polyfill.min.js?features=es2015"></script>
            <script noModule src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/custom-elements-es5-adapter.js"></script>
            <script noModule src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js"></script>
            <script noModule src="https://cdn.theoplayer.com/dash/theoplayer/THEOplayer.chromeless.js"></script>
            <script noModule src="https://theoplayer.github.io/web-ui/dist/THEOplayerUI.es5.js"></script>
        </Head>
    );
};

const InnerTHEOplayerDefaultUI = ({ children = [], ...props }) => {
    return React.createElement('theoplayer-default-ui', props, children);
};

const InnerTHEOplayerUI = ({ children = [], ...props }) => {
    return React.createElement('theoplayer-ui', props, children);
};

export const THEOplayerDefaultUI = ({ configuration, source, ...props }) => {
    const { siteConfig } = useDocusaurusContext();
    configuration = {
        license: siteConfig.customFields.theoplayerLicense,
        libraryLocation: siteConfig.customFields.theoplayerLibraryLocation,
        ...configuration
    };
    return (
        <>
            <Scripts />
            <InnerTHEOplayerDefaultUI configuration={JSON.stringify(configuration)} source={JSON.stringify(source)} {...props} />
        </>
    );
};

export const THEOplayerUI = ({ configuration, source, ...props }) => {
    const { siteConfig } = useDocusaurusContext();
    configuration = {
        license: siteConfig.customFields.theoplayerLicense,
        libraryLocation: siteConfig.customFields.theoplayerLibraryLocation,
        ...configuration
    };
    return (
        <>
            <Scripts />
            <InnerTHEOplayerUI configuration={JSON.stringify(configuration)} source={JSON.stringify(source)} {...props} />
        </>
    );
};
