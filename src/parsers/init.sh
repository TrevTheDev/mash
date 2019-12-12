CMDDIVIDER='___EOC___';
GRPDIVIDER='___EOG___';
statObj()
{
  stat --printf="%a\\0%b\\0%d\\0%F\\0%g\\0%G\\0%h\\0%i\\0%s\\0%t\\0%T\\0%u\\0%U\\0%w\\0%x\\0%y\\0%z\\0%n\\0\\0" -- "$1" || { printf "%s" "STATFAILED"; return 1; };
};

gioObj()
{
  gio info -- "$1" || { printf "%s" "GIOFAILED"; return 1; };
};

lsattrObj()
{
  lsattr -d -- "$1" || { printf "%s" "LSATTRFAILED"; return 1; };
};

queryDirectorySize()
{
  du -b -s0 -- "$1";
  fileSizes=$(find "$1" -type f -print0 | xargs -0 -r stat --print='%s\n' | awk '{total+=$1} END {print total}';)
  if [ -z "$fileSizes" ]; then
    echo "0";
  else 
    echo "$fileSizes";
  fi;
  find "$1" | wc -l;
  find "$1" -type d | wc -l;
};

inspectDir()
{
  local fl1="$4"/*; 
  local fl2="$4"/.[!.]*;
  local fl3="$4"/..?*;
  if [ ! -d "$4" ]; then
    printf "%s" "directory not found: $4";
    return 1;
  fi;
  for inpath in "$4"/* "$4"/.[!.]* "$4"/..?*; do
    if [ "$inpath" != "$fl1" ] && [ "$inpath" != "$fl2" ] && [ "$inpath" != "$fl3" ]; then 
      if ! inspectFSObj "$1" "$2" "$3" "$inpath"; then
        return 1;
      fi;
    fi; 
  done;
};

inspectFSObj(){
  if statObj "$4"; then
    printf "%s" $CMDDIVIDER;
    if [ "$1" -eq 1 ]; then gioObj "$4"; fi;
    printf "%s" $CMDDIVIDER;
    if [ "$2" -eq 1 ]; then lsattrObj "$4"; fi;    
    printf "%s" $CMDDIVIDER;
    if [ "$3" -eq 1 ] && [ -d "$4" ]; then queryDirectorySize "$4"/; fi;
  else
    return 1;
  fi; 
  printf "%s" $GRPDIVIDER; 
};

matchAttrs()
{
  chown "$1:$2" -- "$5" && \
  chmod "$3" -- "$5" && \
  chattr "=$4" -- "$5" && \
  touch -r "$5" "$6";
};

copyDirAttrs()
{
  mkdir -p -- "$5" && \
  matchAttrs "$1" "$2" "$3" "$4" "$5" "$6";
};

pathExists()
{
  if [ -L "$1" ] ; then realpath -zs -- "$1"; else realpath -ze -- "$1"; fi;
};

symlinkTarget()
{
  if [ -L "$1" ] ; then readlink -n -- "$1"; else echo "not a symlink"; return 1; fi;
};

cp_p()
{
  startTime=$(date +%s%N)
  totalSize=$(du --block-size=1 -s0 "${2}" | cut -f 1)
  if [ "$totalSize" -eq 0 ]; then 
    cp "${2}" -- "${3}" "${4}";
    return
  fi;
  strace -q -ewrite cp "${2}" -- "${3}" "${4}" 2>&1 \
    | awk '{
      count += $NF
      timel = systime() - start_time
      if (timel > rep_time) {
        percent = count / total_size * 100
        rate = count / 1048576 / timel
        printf "|%d%%", percent > fifo
        printf "-%s", timel > fifo
        printf "-%d", rate > fifo
        rep_time = timel
        print "" > fifo
      }
    }
    END { 
      percent = count / total_size * 100
      timel = systime() - start_time
      rate = count / 1048576 / timel 
      printf "|DONE"  > fifo
      printf "-%s", timel > fifo
      printf "-%d", rate > fifo
      print "" > fifo
      print count, total_size > fifo
    }' total_size="$totalSize" count=0 start_time="$(date +%s)" rep_time=0 fifo="${1}"
    finalTime=$(date +%s%N)
    rates=$( echo "$totalSize / 1048576 / ( ( $finalTime - $startTime ) / 1000000000 )" | bc )
    echo "totalSize $totalSize" > fifo
    echo "startTime $startTime" > fifo
    echo "finalTime $finalTime" > fifo
    echo "final rate $rates" > fifo
};

user_info()
{
  if [ -z "$1" ] 
  then 
    GETUID=$(id -u);
  else
    if ! GETUID=$(id -u "$1");
    then 
      return 1;
    fi
  fi
  echo "$GETUID";
  UNAME=$(id -un "$GETUID");
  echo "$UNAME";
  EFFECTIVE_GROUP=$(id -g "$GETUID");
  echo "$EFFECTIVE_GROUP";
  GROUPIDS=$(id -G "$GETUID");
  echo "$GROUPIDS";
  GROUPSN=$(id -Gn "$GETUID");
  printf "%s" "$GROUPSN";
};

faketty() {
    script -qfc "$(builtin printf "%q " "$@")" /dev/null
};
