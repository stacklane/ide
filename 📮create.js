import {SourceBuilder, Source} from '🔌';
import {standalone} from '🎨';
import {clone} from 'form';

if (!standalone) throw 'standalone';

let builder = SourceBuilder.name('Test').temporary();

// TODO this fails.. why
//if (clone && clone.startsWith('https://'))
  //  builder = builder.clone(Source.of(clone));

let source = builder.build();

let session = source.newWriteSession();

Redirect.home().dir('sessions').dir(session.id);

