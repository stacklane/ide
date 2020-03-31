import {SourceBuilder, Source} from '🔌';
import {standalone} from '🎨';
import {clone} from 'form';

if (!standalone) throw '!standalone';

let builder = SourceBuilder.name('Test').temporary().clone(Source.of(clone));

let source = builder.build();

let session = source.newWriteSession();

Redirect.home().dir('sessions').dir(session.id);

