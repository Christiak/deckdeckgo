import {h, JSX} from '@stencil/core';

import {v4 as uuid} from 'uuid';

import {DeckdeckgoPlaygroundTheme} from '@deckdeckgo/slide-playground';

import {SlideAttributes, SlideTemplate} from '../../models/data/slide';

import {EnvironmentDeckDeckGoConfig} from '../../services/core/environment/environment-config';
import {EnvironmentConfigService} from '../../services/core/environment/environment-config.service';

import {User} from '../../models/data/user';
import {Deck} from '../../models/data/deck';

import {QRCodeUtils} from './qrcode.utils';
import {SocialUtils} from './social.utils';
import {SlotType} from './slot-type';

export interface InitTemplate {
  template: SlideTemplate;
  elements?: SlotType[];
}

export class CreateSlidesUtils {
  static createSlide(template: InitTemplate, deck?: Deck, user?: User): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>(async (resolve) => {
      if (!document) {
        resolve(null);
        return;
      }

      if (template.template === SlideTemplate.TITLE) {
        resolve(await this.createSlideTitle(template.elements));
      } else if (template.template === SlideTemplate.CONTENT) {
        resolve(await this.createSlideContent(template.elements));
      } else if (template.template === SlideTemplate.SPLIT) {
        resolve(await this.createSlideSplit(template.elements));
      } else if (template.template === SlideTemplate.GIF) {
        resolve(await this.createSlideGif(undefined));
      } else if (template.template === SlideTemplate.AUTHOR) {
        resolve(await this.createSlideAuthor(user));
      } else if (template.template === SlideTemplate.YOUTUBE) {
        resolve(await this.createSlideYoutube());
      } else if (template.template === SlideTemplate.QRCODE) {
        resolve(await this.createSlideQRCode(deck));
      } else if (template.template === SlideTemplate.CHART) {
        resolve(await this.createSlideChart());
        resolve(await this.createSlideQRCode(deck));
      } else if (template.template === SlideTemplate.POLL) {
        resolve(await this.createSlidePoll());
      } else if (template.template === SlideTemplate['ASPECT-RATIO']) {
        resolve(await this.createSlideAspectRatio());
      } else if (template.template === SlideTemplate.PLAYGROUND) {
        resolve(await this.createSlidePlayground());
      } else {
        resolve(null);
      }
    });
  }

  private static createSlideTitle(elements: SlotType[]): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>(async (resolve) => {
      if (!document) {
        resolve();
        return;
      }

      if (!elements || elements.length < 1) {
        resolve();
        return;
      }

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-title key={uuid()}>
          {this.createElement(elements[0], 'title')}
          {elements.length >= 2 ? this.createElement(elements[1], 'content') : undefined}
        </deckgo-slide-title>
      );

      resolve(slide);
    });
  }

  private static createSlideContent(elements: SlotType[]): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      if (!elements || elements.length < 1) {
        resolve();
        return;
      }

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-content key={uuid()}>
          {this.createElement(elements[0], 'title')}
          {elements.length >= 2 ? this.createElement(elements[1], 'content') : undefined}
        </deckgo-slide-content>
      );

      resolve(slide);
    });
  }

  static createSlideSplit(elements: SlotType[], attributes: SlideAttributes = undefined): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      if (!elements || elements.length < 2) {
        resolve();
        return;
      }

      // @ts-ignore
      // prettier-ignore
      const slide: JSX.IntrinsicElements = (<deckgo-slide-split key={uuid()} {...attributes}>
          {this.createElement(elements[0], 'start')}
          {this.createElement(elements[1], 'end')}
        </deckgo-slide-split>
      );

      resolve(slide);
    });
  }

  private static createElement(slotType: SlotType, slotName: 'title' | 'content' | 'start' | 'end'): JSX.IntrinsicElements {
    const Element = slotType.toString();

    return (
      <Element slot={slotName}>
        {slotType === SlotType.OL || slotType === SlotType.UL ? (
          <li>{'\u200B'}</li>
        ) : slotType === SlotType.CODE ? (
          <code slot="code"></code>
        ) : slotType === SlotType.MATH ? (
          <code slot="math"></code>
        ) : slotType === SlotType.WORD_CLOUD ? (
          <code slot="words"></code>
        ) : slotType === SlotType.MARKDOWN ? (
          <div slot="markdown"></div>
        ) : undefined}
      </Element>
    );
  }

  static createSlideGif(src: string): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h2 slot="top"></h2>;

      const content = <h3 slot="bottom"></h3>;

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-gif src={src} key={uuid()}>
          {title}
          {content}
        </deckgo-slide-gif>
      );

      resolve(slide);
    });
  }

  private static createSlideAuthor(user: User): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>(async (resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h1 slot="title">Author</h1>;

      const name: string = user && user.data && user.data.name && user.data.name !== undefined && user.data.name !== '' ? user.data.name : undefined;
      const bio: string = user && user.data && user.data.bio && user.data.bio !== undefined && user.data.bio !== '' ? user.data.bio : undefined;

      // prettier-ignore
      const author = <section slot="author">
          {name !== undefined ? <div>{name}{bio ? <div><br/></div> : undefined}</div> : undefined}
          {bio !== undefined ? <div><small>{bio}</small></div> : undefined}
      </section>;

      const imgSrc: string = user && user.data && user.data.photo_url ? user.data.photo_url : undefined;
      const imgAlt: string = user && user.data && user.data.name ? user.data.name : 'Author';

      const links = await SocialUtils.createSocialLinks(user);

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-author key={uuid()} img-src={imgSrc} img-alt={imgAlt}>
          {title}
          {author}
          {links}
        </deckgo-slide-author>
      );

      resolve(slide);
    });
  }

  static createSlideYoutube(src: string = undefined): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h1 slot="title"></h1>;

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-youtube key={uuid()} src={src}>
          {title}
        </deckgo-slide-youtube>
      );

      resolve(slide);
    });
  }

  static createSlidePlayground(src: string = undefined, theme: DeckdeckgoPlaygroundTheme = undefined): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h1 slot="title"></h1>;

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-playground key={uuid()} src={src} theme={theme}>
          {title}
        </deckgo-slide-playground>
      );

      resolve(slide);
    });
  }

  private static createSlideQRCode(deck: Deck): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h1 slot="title"></h1>;

      const content: string = QRCodeUtils.getPresentationUrl(deck);

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-qrcode
          key={uuid()}
          content={content}
          img-src={`${EnvironmentConfigService.getInstance().get('deckdeckgo').globalAssetsUrl}/img/deckdeckgo-logo.svg`}>
          {title}
        </deckgo-slide-qrcode>
      );

      resolve(slide);
    });
  }

  static createSlideChart(attributes: SlideAttributes = undefined): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const title = <h1 slot="title"></h1>;

      // prettier-ignore
      // @ts-ignore
      const slide: JSX.IntrinsicElements = (<deckgo-slide-chart key={uuid()} {...attributes} custom-loader={true}>
          {title}
        </deckgo-slide-chart>
      );

      resolve(slide);
    });
  }

  static createSlidePoll(question: string = undefined, answers: string[] = undefined): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const questionSlot = <h2 slot="question">{question}</h2>;

      const answerSlots = [];
      answers.forEach((answer: string, i: number) => {
        answerSlots.push(<h3 slot={`answer-${i + 1}`}>{answer}</h3>);
      });

      const deckDeckGoConfig: EnvironmentDeckDeckGoConfig = EnvironmentConfigService.getInstance().get('deckdeckgo');

      const slide: JSX.IntrinsicElements = (
        <deckgo-slide-poll key={uuid()} pollLink={deckDeckGoConfig.pollUrl} socketUrl={deckDeckGoConfig.socketUrl}>
          {questionSlot}
          {...answerSlots}

          <div slot="how-to">
            Go to <a href={EnvironmentConfigService.getInstance().get('deckdeckgo').pollUrl}>deckdeckgo.com/poll</a> and use the code {'{0}'}
          </div>
          <div slot="awaiting-votes">Awaiting votes</div>
        </deckgo-slide-poll>
      );

      resolve(slide);
    });
  }

  private static createSlideAspectRatio(): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const slide: JSX.IntrinsicElements = <deckgo-slide-aspect-ratio key={uuid()} grid={true} editable={true}></deckgo-slide-aspect-ratio>;

      resolve(slide);
    });
  }

  static createSlideDemo(src: string = undefined, mode: 'md' | 'ios'): Promise<JSX.IntrinsicElements> {
    return new Promise<JSX.IntrinsicElements>((resolve) => {
      if (!document) {
        resolve();
        return;
      }

      const start = <section slot="start"></section>;

      const end = <deckgo-demo slot="end" src={src} mode={mode}></deckgo-demo>;

      // @ts-ignore
      // prettier-ignore
      const slide: JSX.IntrinsicElements = (<deckgo-slide-split key={uuid()} type="demo">
            {start}
            {end}
          </deckgo-slide-split>
      );

      resolve(slide);
    });
  }
}
