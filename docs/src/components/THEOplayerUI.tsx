import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { PlayerConfiguration, SourceDescription } from 'theoplayer';

const Scripts = () => {
    const { siteConfig } = useDocusaurusContext();
    const libraryLocation = siteConfig.customFields.theoplayerLibraryLocation;
    const importMap = {
        imports: {
            'theoplayer/chromeless': libraryLocation + 'THEOplayer.chromeless.esm.js'
        }
    };
    return (
        <Head>
            {/* Modern browsers */}
            <script type="importmap">{JSON.stringify(importMap)}</script>
            {/* Import maps polyfill for browsers without import maps support (e.g. Safari 16.3) */}
            <script async src="https://ga.jspm.io/npm:es-module-shims@1.8.0/dist/es-module-shims.js" crossOrigin="anonymous"></script>
            <script type="module" src={useBaseUrl('THEOplayerUI.mjs')}></script>
            {/* Legacy browsers */}
            <script noModule src="https://polyfill.io/v3/polyfill.min.js?features=es2015"></script>
            <script noModule src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/custom-elements-es5-adapter.js"></script>
            <script noModule src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js"></script>
            <script noModule src={libraryLocation + 'THEOplayer.chromeless.js'}></script>
            <script noModule src={useBaseUrl('THEOplayerUI.es5.js')}></script>
        </Head>
    );
};

type CommonTHEOplayerUIProps = React.PropsWithChildren<{
    license?: string;
    libraryLocation?: string;
    fluid?: boolean;
}>;

interface InnerTHEOplayerUIProps extends CommonTHEOplayerUIProps {
    configuration: string;
    source: string;
    license?: string;
    libraryLocation?: string;
}

const InnerTHEOplayerDefaultUI = ({ children = [], ...props }: InnerTHEOplayerUIProps) => {
    return React.createElement('theoplayer-default-ui', props, children);
};

const InnerTHEOplayerUI = ({ children = [], ...props }: InnerTHEOplayerUIProps) => {
    return React.createElement('theoplayer-ui', props, children);
};

interface THEOplayerUIProps extends CommonTHEOplayerUIProps {
    configuration: PlayerConfiguration;
    source: SourceDescription;
}

export const THEOplayerDefaultUI = ({ configuration, source, ...props }: THEOplayerUIProps) => {
    const { siteConfig } = useDocusaurusContext();
    configuration = {
        license: siteConfig.customFields.theoplayerLicense as string,
        libraryLocation: siteConfig.customFields.theoplayerLibraryLocation as string,
        ...configuration
    };
    return (
        <>
            <Scripts />
            <InnerTHEOplayerDefaultUI configuration={JSON.stringify(configuration)} source={JSON.stringify(source)} {...props} />
        </>
    );
};

export const THEOplayerUI = ({ configuration, source, ...props }: THEOplayerUIProps) => {
    const { siteConfig } = useDocusaurusContext();
    configuration = {
        license: siteConfig.customFields.theoplayerLicense as string,
        libraryLocation: siteConfig.customFields.theoplayerLibraryLocation as string,
        ...configuration
    };
    return (
        <>
            <Scripts />
            <InnerTHEOplayerUI configuration={JSON.stringify(configuration)} source={JSON.stringify(source)} {...props} />
        </>
    );
};
