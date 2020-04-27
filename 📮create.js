import {SourceBuilder, SourceSession} from '🔌';
import {standalone} from '🎨';

if (!standalone) throw '!standalone';

let builder = SourceBuilder.name('Test').temporary();

let source = builder.build();

let session = SourceSession.newWriteSession(source);

Redirect.home().dir('sessions').dir(session.id);

