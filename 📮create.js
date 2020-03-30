import {SourceBuilder} from '🔌';
import {standalone} from '🎨';

if (!standalone) throw 'standalone';

let source = SourceBuilder.name('Test').build();

let session = source.newWriteSession();

Redirect.home().dir('sessions').dir(session.id);

