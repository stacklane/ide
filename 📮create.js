import {SourceBuilder} from '🔌';
import {standalone} from '🎨';

if (!standalone) throw '!standalone';

let builder = SourceBuilder.name('Test').temporary();

let source = builder.build();

let session = source.newWriteSession();

Redirect.home().dir('sessions').dir(session.id);

