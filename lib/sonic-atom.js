'use babel';

import SonicAtomView from './sonic-atom-view';
import { CompositeDisposable ,notifications} from 'atom';
const osc = require("osc");

export default {

  sonicAtomView: null,
  modalPanel: null,
  subscriptions: null,
  udpPort:null,
  activate(state) {
    this.sonicAtomView = new SonicAtomView(state.sonicAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sonicAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'sonic-atom:toggle': () => this.toggle(),
      'sonic-atom:stopPlaying': () => this.stopPlaying()
    }));

    this.udpPort = new osc.UDPPort({
	  // This is the port we're listening on.
	  localAddress: "127.0.0.1",
	  localPort: 45511,

	  // This is where sclang is listening for OSC messages.
	  remoteAddress: "127.0.0.1",
	  remotePort: 4557,
	  metadata: true
	});

    console.log("Listening for OSC over UDP.");
    this.udpPort.on("ready", function () {



	});

	this.udpPort.on("message", function () {
	  console.log();
	});

	this.udpPort.on("error", function () {
	  console.log();
	});

	this.udpPort.open();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sonicAtomView.destroy();
  },

  serialize() {
    return {
      sonicAtomViewState: this.sonicAtomView.serialize()
    };
  },

  toggle1() {
    console.log('SonicAtom was toggled!');
    let editor
      if (editor = atom.workspace.getActiveTextEditor()) {
        let selection = editor.getSelectedText()
        let reversed = selection.split('').reverse().join('')
        editor.insertText(reversed)
      }
  },

    toggle(){
        let editor
         if (editor = atom.workspace.getActiveTextEditor()) {
           let selection = editor.getText()
           this.sendOsc(selection)
           atom.notifications.addSuccess('/run-code')

         }
    },
    stopPlaying(){
        var msg = {
          address: "/stop-all-jobs",
          args: [
            {
              type: "s",
              value: "1234"
            }
          ]
        };

        this.udpPort.send(msg);
        atom.notifications.addSuccess('/stop-all-jobs')
    },
   sendOsc (text) {

    var msg = {
      address: "/run-code",
      args: [
        {
          type: "s",
          value: "1234"
        },

        {
          type: "s",
          value: text
        }
      ]
    };

    this.udpPort.send(msg);




  }

};
