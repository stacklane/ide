import {SourceBuilder, Source, SourceSession} from '🔌';
import {standalone} from '🎨';
import {clone} from 'form';

if (!standalone) throw '!standalone';

let builder = SourceBuilder.name('Test').temporary().clone(Source.of(clone));

let source = builder.build();

let session = SourceSession.newWriteSession(source);

Redirect.home().dir('sessions').dir(session.id);

