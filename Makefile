all:
	rm -rf gosha
	mkdir gosha
	rsync -av --exclude 'Makefile' --exclude '.eslint*' --exclude '.git*' --exclude '.travis.yml' --exclude '.editorconfig' --exclude 'node_modules' --exclude '*.log' --exclude 'package.json' --exclude 'gosha/' --exclude '*.md' . gosha/
