nohup anvil --port 8545 --host 157.230.242.107 > anvil.log 2>&1 &
nohup anvil --port 8545 > anvil.log 2>&1 &

nohup anvil --port 8545 --host 0.0.0.0 --mnemonic "test test test test test test test test test test test junk" > anvil.log 2>&1 &

<!-- stop -->
ps -ef | grep "anvil"
kill -9 cmd

tail -f anvil.log
ufw status
ufw enable 
ufw allow 8545
ufw allow 22

DOCKER_BUILDKIT=0 docker-compose up --build -d


sudo adduser newuser
sudo usermod -aG sudo newuser

